import { Card } from "@/components/ui/card";
import { Leaf, Lightbulb, Users, Target, Award, Code, Recycle, Trash2, BarChart3, Monitor } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const About = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Lightbulb,
      title: t("aiPoweredTitle"),
      description: t("aiPoweredDesc")
    },
    {
      icon: Target,
      title: t("userFriendly"),
      description: t("userFriendlyDesc")
    },
    {
      icon: Code,
      title: t("clientSide"),
      description: t("clientSideDesc")
    },
  ];

  const techStack = [
    { name: "TensorFlow.js", purpose: "AI-powered recycling scanner" },
    { name: "Leaflet.js", purpose: "Interactive maps with Malaysian locations" },
    { name: "Chart.js", purpose: "Beautiful data visualization" },
    { name: "React", purpose: "Modern, responsive user interface" },
    { name: "TypeScript", purpose: "Type-safe, reliable code" },
    { name: "Tailwind CSS", purpose: "Beautiful, consistent design" },
  ];

  const goals = [
    {
      icon: Recycle,
      title: t("increaseRecycling"),
      description: t("increaseRecyclingDesc")
    },
    {
      icon: Leaf,
      title: t("envEducation"),
      description: t("envEducationDesc")
    },
    {
      icon: Monitor,
      title: t("techForGood"),
      description: t("techForGoodDesc")
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t("aboutTitle")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("empoweringMalaysians")}
        </p>
      </div>

      {/* Hero Mission */}
      <Card className="p-8 md:p-12 mb-12 shadow-custom-xl gradient-hero text-white text-center">
        <Leaf className="w-16 h-16 mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ourMissionTitle")}</h2>
        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
          {t("missionDescription")}
        </p>
      </Card>

      {/* The Problem */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">{t("theChallenge")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-custom-lg">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 break-words">{t("lowRecyclingRate")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed break-words">
              {t("lowRecyclingDesc")}
            </p>
          </Card>
          <Card className="p-6 shadow-custom-lg">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 break-words">{t("risingWaste")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed break-words">
              {t("risingWasteDesc")}
            </p>
          </Card>
        </div>
      </div>

      {/* Our Solution */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">{t("ourSolution")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 break-words">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed break-words">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">{t("ourGoals")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const GoalIcon = goal.icon;
            return (
              <Card key={index} className="p-6 shadow-custom-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GoalIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-2 break-words">{goal.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed break-words">{goal.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <Card className="p-8 mb-12 shadow-custom-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Code className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">{t("technologyStack")}</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          {t("builtWith")}
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((tech, index) => (
            <div key={index} className="p-4 border rounded-lg hover:border-primary transition-colors">
              <div className="font-semibold text-primary mb-1">{tech.name}</div>
              <div className="text-sm text-muted-foreground">{tech.purpose}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Competition */}
      <Card className="p-8 shadow-custom-xl gradient-warm text-white text-center">
        <Award className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">{t("competition")}</h2>
        <div className="mb-4">
          <p className="text-xl font-bold text-white mb-2">{t("createdBy")}</p>
          <p className="text-2xl font-bold text-white">{t("madeByCreators")}</p>
        </div>
        <p className="text-white/90 max-w-2xl mx-auto mb-4">
          {t("builtByStudents")}
        </p>
        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
          <Users className="w-5 h-5" />
          <span className="font-semibold">{t("madeWithLove")}</span>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("joinMovement")}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t("everyAction")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/recycle">
            <button className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold shadow-custom-lg hover:shadow-custom-xl transition-shadow">
              {t("startScanning")}
            </button>
          </a>
          <a href="/learn">
            <button className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
              {t("learnMore")}
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
