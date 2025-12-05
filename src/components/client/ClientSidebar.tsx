import { FolderOpen, Sofa, Sparkles, Calendar, Settings, Camera } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useSearchParams } from 'react-router-dom';
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

const navItems = [
  { title: 'Meine Galerien', url: '/', icon: FolderOpen, tab: 'galleries' },
  { title: 'Staging anfordern', url: '/?tab=staging', icon: Sofa, tab: 'staging' },
  { title: 'Virtuelle Bearbeitung', url: '/virtuelle-bearbeitung', icon: Sparkles },
  { title: 'Shooting buchen', url: '/buchung', icon: Calendar },
  { title: 'Einstellungen', url: '/?tab=settings', icon: Settings, tab: 'settings' },
];

export function ClientSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPath = location.pathname;
  const currentTab = searchParams.get('tab') || 'galleries';

  const isActive = (item: typeof navItems[0]) => {
    // Handle tab-based navigation for dashboard
    if (item.tab && currentPath === '/') {
      return currentTab === item.tab;
    }
    // Handle regular path matching
    if (!item.tab) {
      return currentPath === item.url;
    }
    return false;
  };

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
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={open ? 'animate-fade-in' : ''}
                >
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/' && !item.tab}
                      className={`group hover:bg-muted/50 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        isActive(item) ? 'bg-muted text-primary font-medium shadow-neu-pressed' : ''
                      }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      {open && (
                        <span className="transition-opacity duration-200">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
