import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
//import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  {/*const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!userRole) return '/';
    return `/${userRole}/dashboard`;
  };
*/}
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-cyan rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-primary">SIBMS</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Desktop CTA */}
          {/*
          
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
          </div>*/}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;