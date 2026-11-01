import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Recycle,
  Battery,
  LocateFixed,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with Leaflet + Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
  hours?: string;
  phone?: string;
  accepts?: string[];
  capacity?: string;
  note?: string;
}

// Escape text before putting it into a Leaflet popup (HTML string)
const esc = (value: string) =>
  String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

const InteractiveMap = () => {
  const { t } = useTranslation();

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<Location | null>(null);

  const [activeFilters, setActiveFilters] = useState<string[]>([
    "recycling",
    "ewaste",
  ]);

  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const filterTypes = useMemo(
    () => [
      {
        id: "recycling",
        label: t("recyclingCenters"),
        color: "#10b981",
        Icon: Recycle,
      },
      {
        id: "ewaste",
        label: t("ewastePoints"),
        color: "#3b82f6",
        Icon: Battery,
      },
    ],
    [t]
  );

  const fetchWithTimeout = useCallback(
    async (
      url: string,
      options: RequestInit = {},
      timeoutMs = 4000
    ) => {
      const controller = new AbortController();

      const timeoutId = window.setTimeout(
        () => controller.abort(),
        timeoutMs
      );

      try {
        return await fetch(url, {
          ...options,
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    []
  );

  const mergeLocations = useCallback((incoming: Location[]) => {
    if (!incoming.length) return;

    setLocations((current) => {
      const seen = new Set(
        current.map(
          (l) => `${l.lat.toFixed(5)},${l.lng.toFixed(5)},${l.type}`
        )
      );

      const merged = [...current];

      let nextId = current.length
        ? Math.max(...current.map((l) => l.id)) + 1
        : 1;

      for (const loc of incoming) {
        const key = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)},${loc.type}`;

        if (seen.has(key)) continue;

        seen.add(key);
        merged.push({ ...loc, id: nextId++ });
      }

      return merged;
    });
  }, []);

  // Load local and Malaysia-wide recycling locations
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadingMessage(t("loadingLocations"));

      try {
        const localRes = await fetchWithTimeout(
          `${import.meta.env.BASE_URL}data/locations.json`,
          {},
          2500
        );

        if (!cancelled && localRes.ok) {
          const local = await localRes.json();

          if (Array.isArray(local) && local.length) {
            setLocations(local);
          }
        }
      } catch (e) {
        console.warn("Local locations failed:", e);
      }

      try {
        const malaysiaRes = await fetchWithTimeout(
          `${import.meta.env.BASE_URL}data/malaysia-osm-locations.json`,
          {},
          8000
        );

        if (!cancelled && malaysiaRes.ok) {
          const malaysiaLocations = await malaysiaRes.json();

          if (Array.isArray(malaysiaLocations)) {
            mergeLocations(malaysiaLocations);
          }
        }
      } catch (e) {
        console.warn("Nationwide data failed:", e);
      }

      try {
        const sgOsmRes = await fetchWithTimeout(
          `${import.meta.env.BASE_URL}data/singapore-osm-locations.json`,
          {},
          8000
        );

        if (!cancelled && sgOsmRes.ok) {
          const sgOsm = await sgOsmRes.json();

          if (Array.isArray(sgOsm)) {
            mergeLocations(sgOsm);
          }
        }
      } catch (e) {
        console.warn("Singapore OSM data failed:", e);
      }

      try {
        const singaporeRes = await fetchWithTimeout(
          `${import.meta.env.BASE_URL}data/singapore-locations.json`,
          {},
          10000
        );

        if (!cancelled && singaporeRes.ok) {
          const singaporeLocations = await singaporeRes.json();

          if (Array.isArray(singaporeLocations)) {
            mergeLocations(singaporeLocations);
          }
        }
      } catch (e) {
        console.warn("Singapore data failed:", e);
      }

      if (!cancelled) {
        setLoading(false);
        setLoadingMessage("");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [t, fetchWithTimeout, mergeLocations]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [4.2105, 101.9758],
      7
    );

    mapRef.current = map;

    canvasRendererRef.current = L.canvas({ padding: 0.5 });

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }
    ).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render filtered recycling markers
  useEffect(() => {
    const map = mapRef.current;

    if (!map || locations.length === 0) return;

    const filteredLocations = locations.filter((loc) =>
      activeFilters.includes(loc.type)
    );

    const colorByType: Record<string, string> = Object.fromEntries(
      filterTypes.map((f) => [f.id, f.color])
    );

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    const group = L.layerGroup();

    for (const location of filteredLocations) {
      const circle = L.circleMarker(
        [location.lat, location.lng],
        {
          renderer: canvasRendererRef.current || undefined,
          radius: filteredLocations.length > 2000 ? 4 : 6,
          color: "#ffffff",
          weight: 1.5,
          fillColor: colorByType[location.type] || "#10b981",
          fillOpacity: 0.95,
        }
      ).on("click", () => {
        setSelectedLocation(location);
      });

      circle.bindPopup(
        `<strong>${esc(location.name)}</strong><br>${esc(location.address)}`
      );

      group.addLayer(circle);
    }

    group.addTo(map);
    markersLayerRef.current = group;

    return () => {
      if (markersLayerRef.current) {
        map.removeLayer(markersLayerRef.current);
        markersLayerRef.current = null;
      }
    };
  }, [locations, activeFilters, filterTypes]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Open Google Maps directions
  const getDirections = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;

    window.open(url, "_blank");
  };

  // Locate current user
  const locateMe = useCallback(() => {
    const map = mapRef.current;

    if (!map) return;

    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (userMarkerRef.current) userMarkerRef.current.remove();
        if (userCircleRef.current) userCircleRef.current.remove();

        userMarkerRef.current = L.marker([
          latitude,
          longitude,
        ])
          .addTo(map)
          .bindPopup("You are here");

        userCircleRef.current = L.circle(
          [latitude, longitude],
          {
            radius: accuracy,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 1,
          }
        ).addTo(map);

        map.setView([latitude, longitude], 14);
        setLocating(false);
      },
      (err) => {
        setLocating(false);

        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied"
            : "Could not get your location"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-words px-2">
          {t("mapTitle")}
        </h1>

        <p className="text-lg text-muted-foreground">
          {t("mapSubtitle")}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 shadow-custom-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {filterTypes.map((filter) => {
              const FilterIcon = filter.Icon;
              const isActive = activeFilters.includes(filter.id);

              return (
                <Button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  variant="outline"
                  size="sm"
                  className={`
                    text-white font-semibold border-0 transition-colors duration-200
                    ${
                      isActive
                        ? filter.id === "recycling"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-500 hover:bg-slate-600"
                    }
                  `}
                >
                  <FilterIcon className="mr-2" size={16} />
                  {filter.label}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={locateMe}
            variant="outline"
            size="sm"
            disabled={locating}
          >
            <LocateFixed className="mr-2" size={16} />
            {locating ? "Locating..." : "My Location"}
          </Button>
        </div>
      </Card>

      {/* Theme-aware Loading Notification */}
      {loading && loadingMessage && (
        <div
          className="
            fixed top-20 left-1/2 -translate-x-1/2
            sm:left-auto sm:right-4 sm:translate-x-0
            z-40 w-[calc(100%-2rem)] sm:w-auto
            max-w-sm animate-slide-in
          "
          role="status"
          aria-live="polite"
        >
          <div
            className="
              flex items-center gap-3
              rounded-xl border border-border
              bg-card/95 text-card-foreground
              px-4 py-3
              shadow-xl backdrop-blur-md
            "
          >
            <div
              className="
                h-5 w-5 flex-shrink-0
                rounded-full border-[2.5px]
                border-primary/25 border-t-primary
                animate-spin
              "
              aria-hidden="true"
            />

            <span className="text-sm font-medium text-foreground">
              {loadingMessage}
            </span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 relative z-0 isolate">
          <Card className="relative z-0 overflow-hidden shadow-custom-lg">
            <div
              ref={mapContainerRef}
              className="relative z-0 w-full h-[600px]"
            />
          </Card>
        </div>

        {/* Location Details */}
        <div className="space-y-6">
          {selectedLocation ? (
            <Card className="p-6 shadow-custom-lg animate-scale-in bg-card text-card-foreground border-border">
              <h2 className="text-2xl font-bold mb-4 break-words text-foreground dark:text-white">
                {selectedLocation.name}
              </h2>

              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />

                  <p className="text-foreground dark:text-white text-sm break-words">
                    {selectedLocation.address}
                  </p>
                </div>

                {/* Opening Hours */}
                {selectedLocation.hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />

                    <p className="text-foreground dark:text-white">
                      {selectedLocation.hours}
                    </p>
                  </div>
                )}

                {/* Phone */}
                {selectedLocation.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />

                    <p className="text-foreground dark:text-white">
                      {selectedLocation.phone}
                    </p>
                  </div>
                )}

                {/* Programme / extra info */}
                {selectedLocation.note && (
                  <p className="text-sm text-muted-foreground dark:text-white/80 break-words">
                    {selectedLocation.note}
                  </p>
                )}

                {/* Accepted Materials */}
                {selectedLocation.accepts && (
                  <div className="pt-3 border-t border-border">
                    <p className="font-semibold mb-2 text-foreground dark:text-white">
                      {t("accepts")}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.accepts.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary dark:bg-emerald-700 dark:text-white rounded-full text-sm font-semibold"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity */}
                {selectedLocation.capacity && (
                  <div className="pt-3 border-t border-border">
                    <p className="font-semibold text-foreground dark:text-white">
                      {t("capacity")} {selectedLocation.capacity}
                    </p>
                  </div>
                )}
              </div>

              {/* Get Directions */}
              <Button
                onClick={() => getDirections(selectedLocation)}
                className="w-full mt-6 gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Navigation className="mr-2" size={18} />
                {t("getDirections")}
              </Button>
            </Card>
          ) : (
            <Card className="p-6 shadow-custom-lg bg-card border-border">
              <p className="text-center text-muted-foreground dark:text-white">
                {t("clickMarker")}
              </p>
            </Card>
          )}

          {/* Legend */}
          <Card className="p-6 shadow-custom-md bg-card border-border">
            <h3 className="font-semibold mb-4 text-foreground dark:text-white">
              {t("legend")}
            </h3>

            <div className="space-y-2">
              {filterTypes.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center space-x-3"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: filter.color }}
                  />

                  <span className="text-sm text-muted-foreground dark:text-white">
                    {filter.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground dark:text-white/70">
              Singapore locations: National Environment Agency (NEA) via{" "}
              <a
                href="https://data.gov.sg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                data.gov.sg
              </a>
              , used under the{" "}
              <a
                href="https://data.gov.sg/open-data-licence"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Singapore Open Data Licence
              </a>
              .
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
