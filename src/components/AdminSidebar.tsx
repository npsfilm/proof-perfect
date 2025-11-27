import { LayoutDashboard, FolderOpen, Settings, BarChart3, Building2, Users, Activity } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50 rounded-2xl"
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
    </Sidebar>
  );
}
