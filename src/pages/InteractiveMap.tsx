import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation, Phone, Clock, Recycle, Battery, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with Leaflet + Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
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
}

const InteractiveMap = () => {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "recycling",
    "ewaste",
  ]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");

  const filterTypes = useMemo(() => [
    { id: "recycling", label: t("recyclingCenters"), color: "#10b981", Icon: Recycle },
    { id: "ewaste", label: t("ewastePoints"), color: "#3b82f6", Icon: Battery },
  ], [t]);

  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit = {}, timeoutMs = 4000) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const mergeLocations = useCallback((incoming: Location[]) => {
    if (!incoming.length) return;
    setLocations((current) => {
      const seen = new Set(current.map((l) => `${l.lat.toFixed(5)},${l.lng.toFixed(5)},${l.type}`));
      const merged = [...current];
      let nextId = current.length ? Math.max(...current.map((l) => l.id)) + 1 : 1;

      for (const loc of incoming) {
        const key = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)},${loc.type}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push({ ...loc, id: nextId++ });
      }

      return merged;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadingMessage(t("loadingLocations"));
      
      try {
        const localRes = await fetchWithTimeout(`${import.meta.env.BASE_URL}data/locations.json`, {}, 2500);
        if (!cancelled && localRes.ok) {
          const local = await localRes.json();
          if (Array.isArray(local) && local.length) {
            setLocations(local);
          }
        }
      } catch (e) {
        console.warn("Local locations failed:", e);
      }

      // Keep "Location loading" notification visible while adding Malaysia-wide locations
      try {
        const malaysiaRes = await fetchWithTimeout(`${import.meta.env.BASE_URL}data/malaysia-osm-locations.json`, {}, 8000);
        if (!cancelled && malaysiaRes.ok) {
          const malaysiaLocations = await malaysiaRes.json();
          if (Array.isArray(malaysiaLocations)) mergeLocations(malaysiaLocations);
        }
      } catch (e) {
        console.warn("Nationwide data failed:", e);
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

  useEffect(() => {
    const ensureRouteBase = () => {
      if (window.location.pathname.startsWith("/MyMalaysiaCare./")) {
        const target = `/${window.location.search}${window.location.hash}`;
        window.history.replaceState(null, "", target);
      }
    };

    ensureRouteBase();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([4.2105, 101.9758], 7);
    mapRef.current = map;
    // High-performance canvas renderer for many points
    canvasRendererRef.current = L.canvas({ padding: 0.5 });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || locations.length === 0) return;

    const filteredLocations = locations.filter((loc) =>
      activeFilters.includes(loc.type)
    );
    const colorByType: Record<string, string> = Object.fromEntries(
      filterTypes.map((f) => [f.id, f.color])
    );

    // Render ALL locations once into a single SVG layer.
    // circleMarker on the default SVG renderer scales smoothly together with
    // the map during the zoom animation (no canvas redraw lag, no jumping).
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    const group = L.layerGroup();
    for (const location of filteredLocations) {
      const circle = L.circleMarker([location.lat, location.lng], {
        radius: 6,
        color: "#ffffff",
        weight: 1.5,
        fillColor: colorByType[location.type] || "#10b981",
        fillOpacity: 0.95,
      }).on("click", () => {
        setSelectedLocation(location);
      });
      circle.bindPopup(`<strong>${location.name}</strong><br>${location.address}`);
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

  const getDirections = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, "_blank");
  };

  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const [locating, setLocating] = useState(false);

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
        userMarkerRef.current = L.marker([latitude, longitude]).addTo(map).bindPopup("You are here");
        userCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(map);
        map.setView([latitude, longitude], 14);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === err.PERMISSION_DENIED ? "Location permission denied" : "Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t("mapTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("mapSubtitle")}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 shadow-custom-md">
        <div className="flex flex-wrap gap-2">
          {filterTypes.map((filter) => {
            const FilterIcon = filter.Icon;
            return (
              <Button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                size="sm"
                className={activeFilters.includes(filter.id) ? "gradient-primary" : ""}
              >
                <FilterIcon className="mr-2" size={16} />
                {filter.label}
              </Button>
            );
          })}
          <Button
            onClick={locateMe}
            variant="outline"
            size="sm"
            disabled={locating}
            className="ml-auto"
          >
            <LocateFixed className="mr-2" size={16} />
            {locating ? "Locating..." : "My Location"}
          </Button>
        </div>
      </Card>

      {loading && loadingMessage && (
        <div className="fixed top-20 right-4 z-[1000] animate-slide-in">
          <div className="inline-flex items-center space-x-3 bg-primary text-white px-4 py-3 rounded-lg shadow-custom-lg backdrop-blur">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{loadingMessage}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden shadow-custom-lg">
            <div ref={mapContainerRef} className="w-full h-[600px]" />
          </Card>
        </div>

        {/* Location Details */}
        <div className="space-y-6">
          {selectedLocation ? (
            <Card className="p-6 shadow-custom-lg animate-scale-in">
              <h2 className="text-2xl font-bold mb-4 break-words">{selectedLocation.name}</h2>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm break-words">{selectedLocation.address}</p>
                </div>

                {selectedLocation.hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{selectedLocation.hours}</p>
                  </div>
                )}

                {selectedLocation.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{selectedLocation.phone}</p>
                  </div>
                )}

                {selectedLocation.accepts && (
                  <div className="pt-3 border-t">
                    <p className="font-semibold mb-2">{t("accepts")}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.accepts.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.capacity && (
                  <div className="pt-3 border-t">
                    <p className="font-semibold">{t("capacity")} {selectedLocation.capacity}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => getDirections(selectedLocation)}
                className="w-full mt-6 gradient-primary"
              >
                <Navigation className="mr-2" size={18} />
                {t("getDirections")}
              </Button>
            </Card>
          ) : (
            <Card className="p-6 shadow-custom-lg">
              <p className="text-center text-muted-foreground">
                {t("clickMarker")}
              </p>
            </Card>
          )}

          {/* Legend */}
          <Card className="p-6 shadow-custom-md">
            <h3 className="font-semibold mb-4">{t("legend")}</h3>
            <div className="space-y-2">
              {filterTypes.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: filter.color }}
                  />
                  <span className="text-sm text-muted-foreground">{filter.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
