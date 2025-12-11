import { LayoutDashboard, FolderOpen, Settings, BarChart3, Building2, Users, Activity, Camera, Eye, Sofa } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
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

const items = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Galerien', url: '/admin/galleries', icon: FolderOpen },
  { title: 'Unternehmen', url: '/admin/companies', icon: Building2 },
  { title: 'Benutzer', url: '/admin/users', icon: Users },
  { title: 'Staging-Anfragen', url: '/admin/staging-requests', icon: Sofa },
  { title: 'Analytik', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Webhook-Logs', url: '/admin/webhook-logs', icon: Activity },
  { title: 'Einstellungen', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar 
      className={`shadow-neu-float rounded-[2rem] transition-all duration-300 ease-in-out ${
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
              <p className="font-semibold text-sm text-foreground truncate">ProofHub</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={open ? 'animate-fade-in' : ''}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={open ? 'animate-fade-in' : ''}
                >
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="group hover:bg-muted/50 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      activeClassName="bg-muted text-primary font-medium shadow-neu-pressed"
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

        {/* Client View Switcher */}
        <SidebarGroup>
          <SidebarGroupLabel className={open ? 'animate-fade-in' : ''}>
            Kunden-Ansicht
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className={open ? 'animate-fade-in' : ''}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className="group hover:bg-muted/50 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    activeClassName="bg-muted text-primary font-medium shadow-neu-pressed"
                  >
                    <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    {open && (
                      <span className="transition-opacity duration-200">Kunden-Dashboard</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 px-3 py-3">
        {open && (
          <div className="text-xs text-muted-foreground animate-fade-in space-y-1">
            <p className="transition-colors duration-200 hover:text-foreground">© 2025 ProofHub</p>
            <p className="transition-colors duration-200 hover:text-foreground">Version 1.0.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
