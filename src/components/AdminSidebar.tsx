import { LayoutDashboard, FolderOpen, Settings, BarChart3, Building2, Users, Activity, Camera, Eye, Sofa, Calendar, ClipboardList, Clock } from 'lucide-react';
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
  { title: 'Kalender', url: '/admin/calendar', icon: Calendar },
  { title: 'Buchungen', url: '/admin/bookings', icon: ClipboardList },
  { title: 'Verfügbarkeit', url: '/admin/settings', icon: Clock },
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
      className={`border-r border-border bg-background transition-all duration-200 ${
        open ? 'w-60' : 'w-14'
      }`} 
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Camera className="h-5 w-5" />
          </div>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">ProofHub</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {open ? 'Menu' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="group hover:bg-muted rounded-md transition-colors"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Client View Switcher */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {open ? 'Ansicht' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className="group hover:bg-muted rounded-md transition-colors"
                    activeClassName="bg-muted text-primary font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    {open && <span>Kunden-Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border px-3 py-3">
        {open && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>© 2025 ProofHub</p>
            <p>Version 1.0.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
