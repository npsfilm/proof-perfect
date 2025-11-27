import { LayoutDashboard, FolderOpen, Settings, BarChart3, Building2, Users, Activity, Camera } from 'lucide-react';
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
  { title: 'Analytik', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Webhook-Logs', url: '/admin/webhook-logs', icon: Activity },
  { title: 'Einstellungen', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className={open ? 'w-60 shadow-neu-float rounded-[2rem]' : 'w-14 shadow-neu-float rounded-[2rem]'} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-neu-flat-sm">
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50 rounded-2xl transition-all"
                      activeClassName="bg-muted text-primary font-medium shadow-neu-pressed"
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
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 px-3 py-3">
        {open && (
          <div className="text-xs text-muted-foreground">
            <p>© 2025 ProofHub</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
