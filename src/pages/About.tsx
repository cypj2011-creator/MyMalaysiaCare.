
import {
  Leaf,
  Lightbulb,
  Target,
  Code,
  Recycle,
  Trash2,
  BarChart3,
  Monitor,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const SectionTitle = ({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-5 mb-8 border-b-2 border-border pb-5">
    <span className="text-5xl md:text-7xl font-black tracking-tighter text-accent leading-none tabular-nums">
      {n}
    </span>
    <h2 className="text-2xl md:text-4xl font-bold text-primary tracking-tight">
      {children}
    </h2>
  </div>
);

const Item = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => (
  <div className="group h-full rounded-xl border border-border bg-card p-6 md:p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300">
    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/15 text-accent mb-5 group-hover:scale-105 transition-transform">
      <Icon className="w-6 h-6" />
    </div>

    <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">
      {title}
    </h3>

    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
);

const About = () => {
  const { t } = useTranslation();

  const challenges = [
    {
      icon: BarChart3,
      title: t("lowRecyclingRate"),
      description: t("lowRecyclingDesc"),
    },
    {
      icon: Trash2,
      title: t("risingWaste"),
      description: t("risingWasteDesc"),
    },
  ];

  const features = [
    {
      icon: Lightbulb,
      title: t("aiPoweredTitle"),
      description: t("aiPoweredDesc"),
    },
    {
      icon: Target,
      title: t("userFriendly"),
      description: t("userFriendlyDesc"),
    },
    {
      icon: Code,
      title: t("clientSide"),
      description: t("clientSideDesc"),
    },
  ];

  const goals = [
    {
      icon: Recycle,
      title: t("increaseRecycling"),
      description: t("increaseRecyclingDesc"),
    },
    {
      icon: Leaf,
      title: t("envEducation"),
      description: t("envEducationDesc"),
    },
    {
      icon: Monitor,
      title: t("techForGood"),
      description: t("techForGoodDesc"),
    },
  ];

  const techStack = [
    { name: "TensorFlow.js", purpose: "AI-powered recycling scanner" },
    { name: "Leaflet.js", purpose: "Interactive maps and locations" },
    { name: "Chart.js", purpose: "Data visualization" },
    { name: "React", purpose: "Modern user interface" },
    { name: "TypeScript", purpose: "Reliable, type-safe code" },
    { name: "Tailwind CSS", purpose: "Responsive visual design" },
  ];

  return (
    <div className="paper-grain">
      <div className="container mx-auto px-4 py-12 md:py-16">

        <PageHeader
          title={t("aboutTitle")}
          subtitle={t("empoweringMalaysians")}
        />

        {/* Mission */}
        <section className="mb-20">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 md:p-12 shadow-sm">
            <div className="absolute -right-12 -top-12 opacity-[0.06]">
              <Leaf className="w-64 h-64" />
            </div>

            <div className="relative grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-3">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="MyMalaysiaCare logo"
                  className="w-20 h-20 object-cover rounded-full border-2 border-primary mb-5"
                />

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
                  {t("ourMissionTitle")}
                </p>
              </div>

              <div className="md:col-span-9">
                <blockquote className="text-2xl md:text-4xl font-semibold leading-snug text-primary">
                  {t("missionDescription")}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* 01 - Challenge */}
        <section className="mb-20">
          <SectionTitle n="01">
            {t("theChallenge")}
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-5">
            {challenges.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* 02 - Solution */}
        <section className="mb-20">
          <SectionTitle n="02">
            {t("ourSolution")}
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* 03 - Goals */}
        <section className="mb-20">
          <SectionTitle n="03">
            {t("ourGoals")}
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-5">
            {goals.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* 04 - Technology */}
        <section className="mb-20">
          <SectionTitle n="04">
            {t("technologyStack")}
          </SectionTitle>

          <p className="text-muted-foreground font-medium mb-7">
            {t("builtWith")}
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Code className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-lg text-primary">
                    {tech.name}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tech.purpose}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Join the Movement */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8 md:p-12 shadow-lg">
            <div className="absolute -right-8 -bottom-12 opacity-10">
              <Recycle className="w-64 h-64" />
            </div>

            <div className="relative grid md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-8">
                <div className="flex items-center gap-2 text-primary-foreground/75 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {t("joinMovement")}
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                  {t("everyAction")}
                </h2>
              </div>

              <div className="md:col-span-4 flex flex-col sm:flex-row gap-3">
                <Link to="/recycle">
                  <Button
                    size="lg"
                    className="w-full rounded-lg bg-background text-primary hover:bg-background/90 font-bold"
                  >
                    {t("startScanning")}
                    <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/learn">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-lg border-primary-foreground/50 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 font-bold"
                  >
                    {t("learnMore")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
