import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Shirt, Camera, User, Menu, X, LogOut } from "lucide-react";
import logoIcon from "@/assets/logo-icon.jpg";
import { useAuth } from "@/hooks/useAuth";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = user ? [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/wardrobe", icon: Shirt, label: "Wardrobe" },
    { to: "/try-on", icon: Camera, label: "Try On" },
    { to: "/profile", icon: User, label: "Profile" },
  ] : [];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-elegant group-hover:shadow-hover-lift transition-all duration-300">
              <img src={logoIcon} alt="Stylist AI" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-xl text-foreground">StyleAI</span>
              <Sparkles className="w-5 h-5 text-fashion-gold animate-float" />
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-elegant"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/auth">Log In</NavLink>
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-hover-lift transition-all duration-300" asChild>
                  <NavLink to="/auth">Sign Up</NavLink>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
            <div className="pt-4 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground px-4">
                    {user.email}
                  </div>
                  <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <NavLink to="/auth">Log In</NavLink>
                  </Button>
                  <Button className="w-full justify-start bg-primary text-primary-foreground" asChild>
                    <NavLink to="/auth">Sign Up</NavLink>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};