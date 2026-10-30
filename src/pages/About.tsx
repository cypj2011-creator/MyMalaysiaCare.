import {
  Leaf,
  Lightbulb,
  Users,
  Target,
  Award,
  Code,
  Recycle,
  Trash2,
  BarChart3,
  Monitor,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const SectionTitle = ({
  n,
  children,
}: {
  n: string;
  children: any;
}) => (
  <div className="flex items-center gap-4 mb-7">
    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
      {n}
    </span>
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold text-primary">
        {children}
      </h2>
    </div>
  </div>
);

const Item = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="group h-full rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
      <Icon className="w-6 h-6" />
    </div>

    <h3 className="text-xl font-semibold text-primary mb-3">
      {title}
    </h3>

    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
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
    { name: "Leaflet.js", purpose: "Interactive maps with Malaysian locations" },
    { name: "Chart.js", purpose: "Data visualization" },
    { name: "React", purpose: "Responsive user interface" },
    { name: "TypeScript", purpose: "Type-safe application development" },
    { name: "Tailwind CSS", purpose: "Consistent interface styling" },
  ];

  return (
    <div className="paper-grain min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">

        {/* PAGE HEADER */}
        <PageHeader
          title={t("aboutTitle")}
          subtitle={t("empoweringMalaysians")}
        />

        {/* MISSION */}
        <section className="mb-16 md:mb-24">
          <div className="rounded-3xl border border-border bg-card p-7 md:p-12 shadow-sm">
            <div className="grid md:grid-cols-12 gap-8 items-center">

              <div className="md:col-span-3">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-border flex items-center justify-center mb-5">
                  <img
                    src={`${import.meta.env.BASE_URL}logo.png`}
                    alt="MyMalaysiaCare logo"
                    className="w-14 h-14 object-contain"
                  />
                </div>

                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  {t("ourMissionTitle")}
                </span>

                <div className="w-12 h-1 bg-primary rounded-full mt-3" />
              </div>

              <div className="md:col-span-9">
                <blockquote className="text-2xl md:text-4xl font-medium leading-snug text-primary">
                  {t("missionDescription")}
                </blockquote>
              </div>

            </div>
          </div>
        </section>

        {/* CHALLENGES */}
        <section className="mb-16 md:mb-24">
          <SectionTitle n="01">
            {t("theChallenge")}
          </SectionTitle>

          <div className="grid sm:grid-cols-2 gap-5">
            {challenges.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* SOLUTION */}
        <section className="mb-16 md:mb-24">
          <SectionTitle n="02">
            {t("ourSolution")}
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* GOALS */}
        <section className="mb-16 md:mb-24">
          <SectionTitle n="03">
            {t("ourGoals")}
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* TECHNOLOGY */}
        <section className="mb-16 md:mb-24">
          <SectionTitle n="04">
            {t("technologyStack")}
          </SectionTitle>

          <div className="rounded-3xl border border-border bg-card p-6 md:p-9 shadow-sm">

            <p className="text-muted-foreground mb-7 max-w-2xl leading-relaxed">
              {t("builtWith")}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex gap-4 items-start rounded-xl border border-border bg-background/50 p-5 transition-colors hover:bg-primary/5"
                >
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-primary mb-1">
                      {tech.name}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tech.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* CREDITS */}
        <section className="mb-16 md:mb-24">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 shadow-lg">

            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-primary-foreground/10" />
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border border-primary-foreground/10" />

            <div className="relative z-10 max-w-3xl">

              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>

              <p className="text-sm uppercase tracking-[0.2em] opacity-75 mb-3">
                {t("createdBy")}
              </p>

              <h2 className="text-3xl md:text-5xl font-semibold mb-5 leading-tight">
                {t("madeByCreators")}
              </h2>

              <p className="text-primary-foreground/80 text-base md:text-lg leading-relaxed mb-7 max-w-2xl">
                {t("builtByStudents")}
              </p>

              <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3 text-sm">
                <Users className="w-4 h-4" />
                {t("madeWithLove")}
              </div>

            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section>
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-8 items-center">

              <div className="md:col-span-8">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  MyMalaysiaCare
                </span>

                <h2 className="text-3xl md:text-4xl font-semibold text-primary mt-3 mb-4">
                  {t("joinMovement")}
                </h2>

                <p className="text-muted-foreground max-w-xl leading-relaxed">
                  {t("everyAction")}
                </p>
              </div>

              <div className="md:col-span-4 flex flex-col gap-3">
                <Link to="/recycle">
                  <Button size="lg" className="w-full rounded-xl">
                    {t("startScanning")}
                    <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/learn">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-xl border-primary text-primary"
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
