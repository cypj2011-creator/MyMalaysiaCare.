import { Link } from "react-router-dom";
import { Camera, Map, BarChart3, BookOpen, ArrowUpRight, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Camera, title: t("smartRecycling"), description: t("smartRecyclingDesc"), link: "/recycle" },
    { icon: Map, title: t("map"), description: t("mapSubtitle"), link: "/map" },
    { icon: BarChart3, title: t("dashboard"), description: t("dashboardDesc"), link: "/dashboard" },
    { icon: BookOpen, title: t("learn"), description: t("learnSubtitle"), link: "/learn" },
  ];

  return (
    <div className="min-h-screen paper-grain">
      {/* Hero */}
      <section className="px-4 pt-14 pb-16 md:pt-20 md:pb-24 border-b border-border">
        <div className="container mx-auto grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.95] font-extrabold text-primary tracking-tight">
              MyMalaysia<span className="italic font-normal text-secondary">Care</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl font-normal leading-relaxed">
              {t("homeSubtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to="/recycle">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-sm shadow-custom-md hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-custom-lg">
                  <Camera className="mr-2" size={20} />
                  {t("recycAI")}
                </Button>
              </Link>
              <Link to="/map">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-sm border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground">
                  <Map className="mr-2" size={20} />
                  {t("map")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stamp card */}
          <aside className="md:col-span-4">
            <div className="relative border-2 border-primary bg-card p-6 rotate-[-1.5deg] shadow-custom-lg">
              <div className="absolute -top-3 left-6 bg-accent text-accent-foreground px-2 py-1">
                <Recycle className="w-4 h-4" />
              </div>
              <dl className="divide-y divide-border">
                {[
                  ["100%", "Client-Side"],
                  ["AI-Powered", "Smart Scanner"],
                  ["24/7", "Available"],
                ].map(([v, l]) => (
                  <div key={l} className="flex items-baseline justify-between py-3">
                    <dt className="text-sm text-muted-foreground font-normal">{l}</dt>
                    <dd className="text-xl sm:text-2xl text-primary text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* Features as numbered index */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            <h2 className="md:col-span-5 text-3xl md:text-5xl text-primary leading-tight">
              {t("whyChoose")}
            </h2>
            <p className="md:col-span-6 md:col-start-7 text-lg text-muted-foreground font-normal leading-relaxed self-end">
              {t("comprehensive")}
            </p>
          </div>

          <ul className="border-t-2 border-primary">
            {features.map((f, i) => (
              <li key={f.link} className="border-b border-border">
                <Link
                  to={f.link}
                  className="group grid grid-cols-[3rem_1fr_auto] md:grid-cols-[5rem_1fr_2fr_auto] gap-4 items-center py-6 md:py-8 hover:bg-muted/60 px-2"
                >
                  <span className="text-sm text-secondary tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl md:text-2xl text-primary flex items-center gap-3">
                    <f.icon className="w-5 h-5 text-secondary shrink-0" />
                    {f.title}
                  </h3>
                  <p className="hidden md:block text-muted-foreground font-normal leading-relaxed">
                    {f.description}
                  </p>
                  <ArrowUpRight className="w-6 h-6 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-4 pb-20">
        <div className="container mx-auto bg-primary text-primary-foreground p-10 md:p-16 grid md:grid-cols-12 gap-8 items-end rounded-sm">
          <div className="md:col-span-8">
            <Recycle className="w-12 h-12 text-accent mb-4" />
            <h2 className="text-3xl md:text-5xl leading-tight">{t("getStarted")}</h2>
            <p className="mt-4 text-lg opacity-80 font-normal max-w-xl">{t("communityDrivenDesc")}</p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link to="/recycle">
              <Button size="lg" className="h-14 px-8 rounded-sm bg-accent text-accent-foreground hover:bg-accent/90">
                {t("getStarted")} <ArrowUpRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
