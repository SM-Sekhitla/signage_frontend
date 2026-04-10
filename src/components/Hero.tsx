import { Button } from "@/components/ui/button";
import { Search, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user, userRole } = useAuth();

  const getStartedLink = () => {
    if (!user) return "/auth/signup";
    if (userRole === 'client') return "/client/dashboard";
    if (userRole === 'installer') return "/installer/dashboard";
    if (userRole === 'admin') return "/admin/dashboard";
    return "/";
  };

  return (
    <section className="relative min-h-[600px] bg-gradient-hero overflow-hidden">
      {/* Geometric Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-white rotate-45" />
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-cyan-bright rotate-12" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-white rounded-full" />
        <div className="absolute bottom-40 right-10 w-28 h-28 border-4 border-cyan-bright rotate-45" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Connect with South Africa's
            <span className="block text-cyan-bright mt-2">
              Premier Signage Installers
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Professional signage installation services at your fingertips. 
            Book qualified installers or showcase your expertise to clients nationwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/installers" className="w-full sm:w-auto">
              <Button variant="default" size="lg" className="w-full">
                <Search className="mr-2" />
                Find Installer
              </Button>
            </Link>
            <Link to={user && userRole === 'installer' ? '/installer/dashboard' : '/auth/signup'} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                <Briefcase className="mr-2" />
                
                {user && userRole === 'installer' ? 'My Dashboard' : 'Become an Installer'}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-cyan-bright mb-2">10+</div>
              <div className="text-white/80 text-sm">Verified Installers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-cyan-bright mb-2">2,000+</div>
              <div className="text-white/80 text-sm">Projects Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-cyan-bright mb-2">9 Provinces</div>
              <div className="text-white/80 text-sm">Nationwide Coverage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
