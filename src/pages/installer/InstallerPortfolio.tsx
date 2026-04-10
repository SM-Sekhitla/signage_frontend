import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import InstallerSidebar from '@/components/installer/InstallerSidebar';
import PortfolioManager from '@/components/installer/PortfolioManager';

export default function InstallerPortfolio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <InstallerSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/installer/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Portfolio Management</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <PortfolioManager />
        </main>
      </div>
    </div>
  );
}
