import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  BarChart3, 
  Building2, 
  Users, 
  Activity, 
  Camera, 
  Eye, 
  Sofa,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

const navGroups = [
  {
    label: 'Übersicht',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
      { title: 'Galerien', url: '/admin/galleries', icon: FolderOpen },
      { title: 'Staging-Anfragen', url: '/admin/staging-requests', icon: Sofa },
    ],
  },
  {
    label: 'Verwaltung',
    items: [
      { title: 'Unternehmen', url: '/admin/companies', icon: Building2 },
      { title: 'Benutzer', url: '/admin/users', icon: Users },
      { title: 'Analytik', url: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Einstellungen', url: '/admin/settings', icon: Settings },
      { title: 'Webhook-Logs', url: '/admin/webhook-logs', icon: Activity },
    ],
  },
];

const viewItems = [
  { title: 'Kunden-Dashboard', url: '/', icon: Eye },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

  const NavItem = ({ item, isActive }: { item: typeof navGroups[0]['items'][0]; isActive: boolean }) => {
    const content = (
      <NavLink
        to={item.url}
        end={item.url === '/admin'}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
          isActive 
            ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[calc(0.75rem+2px)]' 
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {open && <span className="text-sm font-medium">{item.title}</span>}
      </NavLink>
    );

    if (!open) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <Sidebar 
        className={`border-r border-border bg-sidebar-background transition-all duration-200 ${
          open ? 'w-60' : 'w-[76px]'
        }`} 
        collapsible="icon"
      >
        {/* Header with Logo */}
        <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">immoonpoint</p>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-2">
          {/* Navigation Groups */}
          {navGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-2">
              {open && (
                <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="p-0">
                        <NavItem 
                          item={item} 
                          isActive={
                            item.url === '/admin' 
                              ? location.pathname === '/admin'
                              : location.pathname.startsWith(item.url)
                          } 
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          {/* View Switcher */}
          <SidebarGroup className="py-2 border-t border-sidebar-border mt-2">
            {open && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
                Ansicht
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {viewItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavItem item={item} isActive={false} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        {/* Footer with User Info */}
        <SidebarFooter className="border-t border-sidebar-border p-3">
          {open ? (
            <div className="space-y-3">
              {/* User Card */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Administrator</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => window.open('mailto:support@immoonpoint.de', '_blank')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Hilfe
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 justify-start text-muted-foreground hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </Button>
              </div>
              
              {/* Version */}
              <p className="text-[10px] text-muted-foreground/60 text-center">
                © 2025 immoonpoint · v1.0.0
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{user?.email}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Abmelden</TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
