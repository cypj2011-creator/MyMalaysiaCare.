import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [lang, setLang] = useState<string>(() => localStorage.getItem("lang") || "en");
  const languages = [
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
    { code: "ms", label: "Malay" },
  ];

  const handleLangChange = (v: string) => {
    setLang(v);
    localStorage.setItem("lang", v);
    window.dispatchEvent(new Event("languageChange"));
  };
  
  const isGuest = !!(user as any)?.is_anonymous;

  const navItems = [
    { path: "/", label: "Home", key: "home" },
    { path: "/recycle", label: "RecycAI", key: "recycAI" },
    { path: "/map", label: "Map", key: "map" },
    { path: "/dashboard", label: "Dashboard", key: "dashboard" },
    { path: "/leaderboard", label: "Leaderboard", key: "leaderboard" },
    { path: "/learn", label: "Learn", key: "learn" },
    { path: "/about", label: "About", key: "about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="MyMalaysiaCare logo" className="w-full h-full object-cover" />
</div>
          <span className="font-bold text-base sm:text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-words leading-tight">
            MyMalaysiaCare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={isActive(item.path) ? "gradient-primary text-white" : ""}
              >
                {item.label}
              </Button>
            </Link>
          ))}

          {/* Language Selector */}
          <div className="ml-2">
            <Select value={lang} onValueChange={handleLangChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {/* Desktop Auth */}
          {user ? (
            <div className="flex items-center space-x-2 ml-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="max-w-[120px] truncate hidden lg:inline">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="ml-4">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive(item.path) ? "gradient-primary text-white" : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* Mobile Language Selector */}
            <div className="pt-2">
              <Select value={lang} onValueChange={handleLangChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
            
            {/* Mobile Auth */}
            <div className="pt-4 border-t border-border/40">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                    <User className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
