import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-navy text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-cyan-bright">SIBMS</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Signage Installer Booking & Management System - Connecting South Africa's 
              leading signage professionals with businesses nationwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/80 hover:text-cyan-bright transition-colors">
                  Find Installers
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-cyan-bright transition-colors">
                  Register as Installer
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-cyan-bright transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-cyan-bright mt-0.5 flex-shrink-0" />
                <span className="text-white/80">info@sibms.co.za</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-cyan-bright mt-0.5 flex-shrink-0" />
                <span className="text-white/80">+27 11 123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-bright mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Johannesburg, South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © 2025 SIBMS. All rights reserved. |  Signage Installation Services
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
