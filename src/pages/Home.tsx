import { Link } from "react-router-dom";
import { 
  Camera, 
  Map, 
  BarChart3, 
  Leaf, 
  BookOpen,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Camera,
      title: t("smartRecycling"),
      description: t("smartRecyclingDesc"),
      link: "/recycle",
      gradient: "gradient-primary",
    },
    {
      icon: Map,
      title: t("map"),
      description: t("mapSubtitle"),
      link: "/map",
      gradient: "gradient-secondary",
    },
    {
      icon: BarChart3,
      title: t("dashboard"),
      description: t("dashboardDesc"),
      link: "/dashboard",
      gradient: "gradient-warm",
    },
    {
      icon: BookOpen,
      title: t("learn"),
      description: t("learnSubtitle"),
      link: "/learn",
      gradient: "gradient-primary",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10 -z-10" />
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in leading-[1.15] pb-2">
            MyMalaysiaCare
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
            {t("homeSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link to="/recycle" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gradient-primary text-white shadow-custom-lg hover:shadow-custom-xl transition-all py-6 text-lg px-8">
                <Camera className="mr-3" size={24} />
                {t("recycAI")}
              </Button>
            </Link>
            <Link to="/map" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-primary/5 py-6 text-lg px-8">
                <Map className="mr-3" size={24} />
                {t("map")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto px-2">
            <Card className="p-2 sm:p-4 text-center shadow-custom-md hover:shadow-custom-lg transition-shadow">
              <div className="text-xl sm:text-3xl font-bold text-primary">100%</div>
              <div className="text-[9px] sm:text-sm text-muted-foreground leading-tight">Client-Side</div>
            </Card>
            <Card className="p-2 sm:p-4 text-center shadow-custom-md hover:shadow-custom-lg transition-shadow">
              <div className="text-base sm:text-3xl font-bold text-secondary leading-tight">
                AI-Powered
              </div>
              <div className="text-[9px] sm:text-sm text-muted-foreground leading-tight mt-1">Smart Scanner</div>
            </Card>
            <Card className="p-2 sm:p-4 text-center shadow-custom-md hover:shadow-custom-lg transition-shadow">
              <div className="text-xl sm:text-3xl font-bold text-accent">24/7</div>
              <div className="text-[9px] sm:text-sm text-muted-foreground leading-tight">Available</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("whyChoose")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("comprehensive")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="p-6 h-full hover:shadow-custom-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <div className={`w-12 h-12 rounded-lg ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 break-words">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed break-words">{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <Card className="container mx-auto max-w-4xl p-8 md:p-12 shadow-custom-xl gradient-hero text-white">
          <div className="text-center">
            <Recycle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("getStarted")}
            </h2>
            <p className="text-lg mb-8 text-white/90">
              {t("communityDrivenDesc")}
            </p>
            <Link to="/recycle">
              <Button size="lg" variant="secondary" className="shadow-custom-lg">
                {t("getStarted")}
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
