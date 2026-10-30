import { Link } from "react-router-dom";
import { Github, Mail } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const linkCls = "hover:text-primary hover:underline underline-offset-4";

  return (
    <footer className="border-t-2 border-primary bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="MyMalaysiaCare logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl text-primary">MyMalaysiaCare</span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
              AI-powered environmental protection for a greener Malaysia.
            </p>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-secondary mb-3">Features</h3>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li><Link to="/recycle" className={linkCls}>RecycAI Scanner</Link></li>
              <li><Link to="/map" className={linkCls}>Interactive Map</Link></li>
              <li><Link to="/dashboard" className={linkCls}>Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-secondary mb-3">Resources</h3>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li><Link to="/learn" className={linkCls}>Learn Recycling</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-secondary mb-3">Connect</h3>
            <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <a href="mailto:cypj2011@gmail.com" className={`flex items-center gap-2 ${linkCls}`}>
                <Mail size={16} /> Contact Us
              </a>
              <a href="https://github.com/cypj2011-creator/MyMalaysiaCare." target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${linkCls}`}>
                <Github size={16} /> Open Source
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row md:justify-between gap-2 text-sm text-muted-foreground pr-16 md:pr-20">
          <p className="text-foreground">{t("madeBy")}</p>
          <p>© {currentYear} MyMalaysiaCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
