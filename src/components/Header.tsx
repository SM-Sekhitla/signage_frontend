import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  hideNavLinks?: boolean;
}

const Header = ({ hideNavLinks = false }: HeaderProps) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!userRole) return '/';
    return `/${userRole}/dashboard`;
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-cyan rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-primary">SIBMS</span>
          </Link>

          {/* Desktop Navigation - Only show for non-logged in users */}
          {!hideNavLinks && !user && (
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">
                Find Installers
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">
                How It Works
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">
                About Us
              </a>
            </nav>
          )}

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="default"
                  onClick={() => navigate(getDashboardLink())}
                >
                  Dashboard
                </Button>
                <Button variant="secondary" size="default" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="default">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="secondary" size="default">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4">
            {!hideNavLinks && !user && (
              <nav className="flex flex-col gap-4">
                <a 
                  href="#" 
                  className="text-foreground hover:text-accent transition-colors font-medium px-2 py-2"
                  onClick={handleNavClick}
                >
                  Find Installers
                </a>
                <a 
                  href="#" 
                  className="text-foreground hover:text-accent transition-colors font-medium px-2 py-2"
                  onClick={handleNavClick}
                >
                  How It Works
                </a>
                <a 
                  href="#" 
                  className="text-foreground hover:text-accent transition-colors font-medium px-2 py-2"
                  onClick={handleNavClick}
                >
                  About Us
                </a>
              </nav>
            )}
            
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="default"
                    className="justify-start"
                    onClick={() => {
                      navigate(getDashboardLink());
                      handleNavClick();
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="default" 
                    className="justify-start"
                    onClick={() => {
                      signOut();
                      handleNavClick();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={handleNavClick}>
                    <Button variant="ghost" size="default" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/signup" onClick={handleNavClick}>
                    <Button variant="secondary" size="default" className="w-full justify-start">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;