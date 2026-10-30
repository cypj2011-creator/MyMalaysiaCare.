import { Leaf, Lightbulb, Users, Target, Award, Code, Recycle, Trash2, BarChart3, Monitor, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const SectionTitle = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <div className="flex items-baseline gap-4 mb-6 border-b border-border pb-3">
    <span className="text-sm text-secondary tabular-nums">{n}</span>
    <h2 className="text-2xl md:text-3xl text-primary">{children}</h2>
  </div>
);

const About = () => {
  const { t } = useTranslation();

  const challenges = [
    { icon: BarChart3, title: t("lowRecyclingRate"), description: t("lowRecyclingDesc") },
    { icon: Trash2, title: t("risingWaste"), description: t("risingWasteDesc") },
  ];
  const features = [
    { icon: Lightbulb, title: t("aiPoweredTitle"), description: t("aiPoweredDesc") },
    { icon: Target, title: t("userFriendly"), description: t("userFriendlyDesc") },
    { icon: Code, title: t("clientSide"), description: t("clientSideDesc") },
  ];
  const goals = [
    { icon: Recycle, title: t("increaseRecycling"), description: t("increaseRecyclingDesc") },
    { icon: Leaf, title: t("envEducation"), description: t("envEducationDesc") },
    { icon: Monitor, title: t("techForGood"), description: t("techForGoodDesc") },
  ];
  const techStack = [
    { name: "TensorFlow.js", purpose: "AI-powered recycling scanner" },
    { name: "Leaflet.js", purpose: "Interactive maps with Malaysian locations" },
    { name: "Chart.js", purpose: "Beautiful data visualization" },
    { name: "React", purpose: "Modern, responsive user interface" },
    { name: "TypeScript", purpose: "Type-safe, reliable code" },
    { name: "Tailwind CSS", purpose: "Beautiful, consistent design" },
  ];

  const Item = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="py-5 border-b border-border md:border-b-0">
      <Icon className="w-6 h-6 text-secondary mb-3" />
      <h3 className="text-xl text-primary mb-2 break-words">{title}</h3>
      <p className="text-muted-foreground leading-relaxed break-words">{description}</p>
    </div>
  );

  return (
    <div className="paper-grain">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <PageHeader title={t("aboutTitle")} subtitle={t("empoweringMalaysians")} />

        {/* Mission as pull quote */}
        <section className="mb-16 grid md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="MyMalaysiaCare logo" className="w-16 h-16 mb-4 object-cover rounded-full border-2 border-primary" />
            <p className="text-sm uppercase tracking-[0.2em] text-secondary">{t("ourMissionTitle")}</p>
          </div>
          <blockquote className="md:col-span-9 text-2xl md:text-4xl leading-snug text-primary italic font-normal border-l-4 border-accent pl-6">
            {t("missionDescription")}
          </blockquote>
        </section>

        <section className="mb-16">
          <SectionTitle n="01">{t("theChallenge")}</SectionTitle>
          <div className="grid md:grid-cols-2 gap-x-12">{challenges.map((c) => <Item key={c.title} {...c} />)}</div>
        </section>

        <section className="mb-16">
          <SectionTitle n="02">{t("ourSolution")}</SectionTitle>
          <div className="grid md:grid-cols-3 gap-x-12">{features.map((c) => <Item key={c.title} {...c} />)}</div>
        </section>

        <section className="mb-16">
          <SectionTitle n="03">{t("ourGoals")}</SectionTitle>
          <div className="grid md:grid-cols-3 gap-x-12">{goals.map((c) => <Item key={c.title} {...c} />)}</div>
        </section>

        <section className="mb-16">
          <SectionTitle n="04">{t("technologyStack")}</SectionTitle>
          <p className="text-muted-foreground mb-6">{t("builtWith")}</p>
          <dl className="grid sm:grid-cols-2 md:grid-cols-3 border-t border-l border-border">
            {techStack.map((tech) => (
              <div key={tech.name} className="p-5 border-r border-b border-border bg-card">
                <dt className="text-lg text-primary">{tech.name}</dt>
                <dd className="text-sm sm:text-base text-muted-foreground mt-1">{tech.purpose}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Credits */}
        <section className="mb-16 border-2 border-primary bg-card p-8 md:p-12 shadow-custom-lg">
          <Award className="w-12 h-12 text-accent mb-4" />
          <p className="text-lg text-muted-foreground mb-1">{t("createdBy")}</p>
          <p className="text-2xl md:text-4xl text-primary leading-tight mb-4">{t("madeByCreators")}</p>
          <p className="text-muted-foreground max-w-2xl mb-6 leading-relaxed">{t("builtByStudents")}</p>
          <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-sm">
            <Users className="w-4 h-4" /> {t("madeWithLove")}
          </span>
        </section>

        <section className="grid md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-8">
            <h2 className="text-3xl md:text-4xl text-primary mb-3">{t("joinMovement")}</h2>
            <p className="text-muted-foreground max-w-xl leading-relaxed">{t("everyAction")}</p>
          </div>
          <div className="md:col-span-4 flex flex-col sm:flex-row md:justify-end gap-3">
            <Link to="/recycle"><Button size="lg" className="w-full rounded-sm">{t("startScanning")} <ArrowUpRight className="ml-2 w-4 h-4" /></Button></Link>
            <Link to="/learn"><Button size="lg" variant="outline" className="w-full rounded-sm border-2 border-primary text-primary bg-transparent">{t("learnMore")}</Button></Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
