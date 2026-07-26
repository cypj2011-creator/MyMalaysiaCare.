import { Link } from "react-router-dom";
import { Leaf, Github, Mail, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MyMalaysiaCare
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered environmental protection for a greener Malaysia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/recycle" className="hover:text-primary transition-colors">
                  RecycAI Scanner
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-primary transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/learn" className="hover:text-primary transition-colors">
                  Learn Recycling
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="space-y-2">
              <a
                href="mailto:info@mymalaysiacare.com"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={16} />
                <span>Contact Us</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={16} />
                <span>Open Source</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-3">
            {t("madeBy")}
          </p>
          <p className="mt-2">
            © {currentYear} MyMalaysiaCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
