import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  eyebrowClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

/** Editorial page header: small label, large serif title, subtitle, ruled bottom edge. */
const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  icon,
  eyebrowClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}: PageHeaderProps) => (
  <header className="border-b-2 border-primary pb-8 mb-10 md:mb-14">
    {eyebrow && (
      <p
        className={`text-xs sm:text-sm uppercase tracking-[0.2em] text-secondary mb-4 flex items-center gap-2 ${eyebrowClassName}`}
      >
        {icon}
        {eyebrow}
      </p>
    )}

    <h1
      className={`text-[clamp(2.25rem,7vw,4.5rem)] leading-[1] font-extrabold text-primary tracking-tight break-words ${titleClassName}`}
    >
      {title}
    </h1>

    {subtitle && (
      <p
        className={`mt-5 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed ${subtitleClassName}`}
      >
        {subtitle}
      </p>
    )}
  </header>
);

export default PageHeader;
