import { FolderOpen, Sofa, Sparkles, Calendar, Settings, Camera, Menu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { title: 'Meine Galerien', url: '/', icon: FolderOpen, tab: 'galleries' },
  { title: 'Staging anfordern', url: '/?tab=staging', icon: Sofa, tab: 'staging' },
  { title: 'Virtuelle Bearbeitung', url: '/virtuelle-bearbeitung', icon: Sparkles },
  { title: 'Shooting buchen', url: '/buchung', icon: Calendar },
  { title: 'Einstellungen', url: '/?tab=settings', icon: Settings, tab: 'settings' },
];

function SidebarNavContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPath = location.pathname;
  const currentTab = searchParams.get('tab') || 'galleries';

  const isActive = (item: typeof navItems[0]) => {
    if (item.tab && currentPath === '/') {
      return currentTab === item.tab;
    }
    if (!item.tab) {
      return currentPath === item.url;
    }
    return false;
  };

  return (
    <SidebarMenu>
      {navItems.map((item, index) => (
        <SidebarMenuItem 
          key={item.title}
          style={{ animationDelay: `${index * 30}ms` }}
          className="animate-fade-in"
        >
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === '/' && !item.tab}
              onClick={onItemClick}
              className={`group hover:bg-muted/50 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                isActive(item) ? 'bg-muted text-primary font-medium shadow-neu-pressed' : ''
              }`}
              activeClassName=""
            >
              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="transition-opacity duration-200">{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// Mobile navigation content (no sidebar context dependencies)
function MobileNavContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPath = location.pathname;
  const currentTab = searchParams.get('tab') || 'galleries';

  const isActive = (item: typeof navItems[0]) => {
    if (item.tab && currentPath === '/') {
      return currentTab === item.tab;
    }
    if (!item.tab) {
      return currentPath === item.url;
    }
    return false;
  };

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          onClick={onItemClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive(item) 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
          activeClassName=""
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// Mobile Sheet/Drawer Navigation
export function MobileClientNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border/50 px-4 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-neu-flat-sm">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-foreground">immoonpoint</p>
              <p className="text-xs text-muted-foreground font-normal">Kundenportal</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3 px-2">Navigation</p>
          <MobileNavContent onItemClick={() => setOpen(false)} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">© 2025 immoonpoint</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
export function ClientSidebar() {
  const { open } = useSidebar();
  const isMobile = useIsMobile();

  // Don't render desktop sidebar on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar 
      className={`shadow-neu-float rounded-r-[2rem] transition-all duration-300 ease-in-out ${
        open ? 'w-60' : 'w-14'
      }`} 
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/50 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-neu-flat-sm transition-transform duration-200 hover:scale-110 active:scale-95">
            <Camera className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-0' : 'rotate-12'}`} />
          </div>
          {open && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="font-semibold text-sm text-foreground truncate">immoonpoint</p>
              <p className="text-xs text-muted-foreground">Kundenportal</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={open ? 'animate-fade-in' : ''}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNavContent />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 px-3 py-3">
        {open && (
          <div className="text-xs text-muted-foreground animate-fade-in space-y-1">
            <p className="transition-colors duration-200 hover:text-foreground">© 2025 immoonpoint</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
