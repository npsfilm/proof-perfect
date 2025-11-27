import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="space-y-3 animate-fade-in">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              )}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="group text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-x-0.5 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1.5 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
