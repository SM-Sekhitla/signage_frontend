import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbConfig {
  path: string;
  label: string;
  parent?: string;
}

const breadcrumbMap: BreadcrumbConfig[] = [
  // Client routes
  { path: '/client/dashboard', label: 'Dashboard' },
  { path: '/client/bookings', label: 'My Bookings', parent: '/client/dashboard' },
  { path: '/client/history', label: 'History', parent: '/client/dashboard' },
  { path: '/client/search', label: 'Search', parent: '/client/dashboard' },
  
  // Installer routes
  { path: '/installer/dashboard', label: 'Dashboard' },
  { path: '/installer/profile', label: 'Profile', parent: '/installer/dashboard' },
  { path: '/installer/bookings', label: 'Bookings', parent: '/installer/dashboard' },
  { path: '/installer/portfolio', label: 'Portfolio', parent: '/installer/dashboard' },
  { path: '/installer/settings', label: 'Settings', parent: '/installer/dashboard' },
  
  // Public routes
  { path: '/installers', label: 'Find Installers' },
];

function getBreadcrumbTrail(pathname: string): BreadcrumbConfig[] {
  const trail: BreadcrumbConfig[] = [];
  let currentPath = pathname;
  
  while (currentPath) {
    const config = breadcrumbMap.find(b => b.path === currentPath);
    if (config) {
      trail.unshift(config);
      currentPath = config.parent || '';
    } else {
      break;
    }
  }
  
  return trail;
}

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const trail = getBreadcrumbTrail(location.pathname);
  
  if (trail.length === 0) return null;
  
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {trail.map((item, index) => (
          <BreadcrumbItem key={item.path}>
            {index < trail.length - 1 ? (
              <>
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="flex items-center gap-1">
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
              </>
            ) : (
              <BreadcrumbPage className="flex items-center gap-1">
                {trail.length === 1 && <Home className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
