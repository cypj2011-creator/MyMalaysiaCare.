
import { Link } from "react-router-dom";
import {
  Camera,
  Map,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  Recycle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Camera,
      title: t("smartRecycling"),
      description: t("smartRecyclingDesc"),
      link: "/recycle",
    },
    {
      icon: Map,
      title: t("map"),
      description: t("mapSubtitle"),
      link: "/map",
    },
    {
      icon: BarChart3,
      title: t("dashboard"),
      description: t("dashboardDesc"),
      link: "/dashboard",
    },
    {
      icon: BookOpen,
      title: t("learn"),
      description: t("learnSubtitle"),
      link: "/learn",
    },
  ];

  return (
    <div className="min-h-screen paper-grain">

      {/* Hero */}
      <section className="px-4 pt-10 pb-12 md:pt-16 md:pb-16 border-b border-border">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* Hero Content */}
          <div className="md:col-span-8 w-full flex flex-col items-center text-center md:items-start md:text-left">

            <h1 className="w-full whitespace-nowrap text-center md:text-left text-[clamp(2rem,8.5vw,5.8rem)] leading-none font-extrabold text-primary tracking-[-0.06em]">
              MyMalaysia<span className="italic font-semibold text-secondary">Care</span>
            </h1>

            <p className="mt-5 text-lg md:text-2xl text-primary font-semibold max-w-2xl leading-relaxed">
              {t("homeSubtitle")}
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center md:justify-start">
              <Link to="/recycle" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base rounded-sm shadow-custom-md hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-custom-lg transition-all"
                >
                  <Camera className="mr-2" size={20} />
                  {t("recycAI")}
                </Button>
              </Link>

              <Link to="/map" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 text-base rounded-sm border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Map className="mr-2" size={20} />
                  {t("map")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stamp Card */}
          <aside className="md:col-span-4 w-full max-w-md mx-auto md:max-w-none">
            <div className="relative border-2 border-primary bg-card p-6 rotate-[-1deg] shadow-custom-lg rounded-sm">
              <div className="absolute -top-3 left-6 bg-accent text-accent-foreground px-3 py-1">
                <Recycle className="w-4 h-4" />
              </div>

              <dl className="divide-y divide-border">
                {[
                  ["100%", "Client-Side"],
                  ["AI-Powered", "Smart Scanner"],
                  ["24/7", "Available"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between py-3"
                  >
                    <dt className="text-sm text-muted-foreground font-medium">
                      {label}
                    </dt>

                    <dd className="text-xl sm:text-2xl font-bold text-primary text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto">

          <div className="grid md:grid-cols-12 gap-6 mb-8 items-end">
            <h2 className="md:col-span-5 text-3xl md:text-5xl font-bold text-primary leading-tight tracking-tight">
              {t("whyChoose")}
            </h2>

            <p className="md:col-span-6 md:col-start-7 text-base md:text-lg text-muted-foreground font-extrabold leading-relaxed self-end">
              Small actions. Greener tomorrows.
            </p>
          </div>

          <ul className="border-t-2 border-primary">
            {features.map((feature, index) => (
              <li key={feature.link} className="border-b border-border">
                <Link
                  to={feature.link}
                  className="group grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[5rem_1fr_2fr_auto] gap-3 md:gap-4 items-center py-5 md:py-7 hover:bg-muted/60 px-2 transition-colors"
                >
                  <span className="text-base md:text-lg font-bold text-secondary tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="text-lg md:text-2xl font-bold text-primary flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-secondary shrink-0" />
                    {feature.title}
                  </h3>

                  <p className="hidden md:block text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>

                  <ArrowUpRight className="w-6 h-6 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 pb-12 md:pb-16">
        <div className="container mx-auto bg-primary text-primary-foreground p-8 md:p-12 grid md:grid-cols-12 gap-6 items-center rounded-sm">

          <div className="md:col-span-8">
            <Recycle className="w-10 h-10 text-accent mb-4" />

            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              {t("getStarted")}
            </h2>

            <p className="mt-3 text-base md:text-lg opacity-90 font-medium max-w-xl leading-relaxed">
              {t("communityDrivenDesc")}
            </p>
          </div>

          <div className="md:col-span-4 md:text-right">
            <Link to="/recycle">
              <Button
                size="lg"
                className="h-14 px-8 rounded-sm bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
              >
                {t("getStarted")}
                <ArrowUpRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
