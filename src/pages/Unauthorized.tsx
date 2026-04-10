import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <ShieldAlert className="h-24 w-24 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-navy mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>
        <Link to="/">
          <Button variant="default" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
