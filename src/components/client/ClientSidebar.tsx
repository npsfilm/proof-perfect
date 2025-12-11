import { useState } from 'react';
import { 
  FolderOpen, 
  Settings, 
  Sofa, 
  Sparkles, 
  Menu, 
  X,
  LogOut,
  HelpCircle,
  Camera
} from 'lucide-react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClientProfile } from '@/hooks/useClientProfile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const navGroups = [
  {
    label: 'Navigation',
    items: [
      { title: 'Meine Galerien', url: '/', icon: FolderOpen, tabParam: null },
      { title: 'Staging anfordern', url: '/', icon: Sofa, tabParam: 'staging' },
      { title: 'Virtuelle Bearbeitung', url: '/virtuelle-bearbeitung', icon: Sparkles, tabParam: null },
    ],
  },
  {
    label: 'Konto',
    items: [
      { title: 'Einstellungen', url: '/', icon: Settings, tabParam: 'settings' },
    ],
  },
];

interface NavItemProps {
  item: typeof navGroups[0]['items'][0];
  isActive: boolean;
  showLabel: boolean;
  onItemClick?: () => void;
}

function NavItem({ item, isActive, showLabel, onItemClick }: NavItemProps) {
  const getItemUrl = () => {
    if (item.tabParam) {
      return `${item.url}?tab=${item.tabParam}`;
    }
    return item.url;
  };

  const content = (
    <NavLink
      to={getItemUrl()}
      onClick={onItemClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[calc(0.75rem+2px)]' 
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {showLabel && <span className="text-sm font-medium">{item.title}</span>}
    </NavLink>
  );

  if (!showLabel) {
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
}

function SidebarNavContent({ onItemClick, showLabels = true }: { onItemClick?: () => void; showLabels?: boolean }) {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const isItemActive = (item: typeof navGroups[0]['items'][0]) => {
    if (item.tabParam) {
      return currentTab === item.tabParam;
    }
    if (item.url === '/') {
      return location.pathname === '/' && !currentTab;
    }
    return location.pathname === item.url;
  };

  return (
    <>
      {navGroups.map((group) => (
        <SidebarGroup key={group.label} className="py-2">
          {showLabels && (
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
                      isActive={isItemActive(item)}
                      showLabel={showLabels}
                      onItemClick={onItemClick}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

export function MobileClientNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useClientProfile(user?.email);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getDisplayName = () => {
    if (profile?.vorname && profile?.nachname) {
      const anrede = profile.anrede === 'Herr' ? 'Herr' : profile.anrede === 'Frau' ? 'Frau' : '';
      return `${anrede} ${profile.vorname} ${profile.nachname}`.trim();
    }
    return user?.email?.split('@')[0] || 'Kunde';
  };

  const userInitials = profile?.vorname && profile?.nachname
    ? `${profile.vorname[0]}${profile.nachname[0]}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'KD';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <VisuallyHidden>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Hauptnavigation für die mobile Ansicht</SheetDescription>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">immoonpoint</p>
                <p className="text-xs text-muted-foreground">Kundenportal</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* User Card */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="px-2 py-4">
          <TooltipProvider>
            <SidebarNavContent onItemClick={() => setIsOpen(false)} showLabels={true} />
          </TooltipProvider>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-start text-muted-foreground"
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
          <p className="text-[10px] text-muted-foreground/60 text-center">
            © 2025 immoonpoint · v1.0.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ClientSidebar() {
  const { open } = useSidebar();
  const { user, signOut } = useAuth();
  const { data: profile } = useClientProfile(user?.email);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getDisplayName = () => {
    if (profile?.vorname && profile?.nachname) {
      const anrede = profile.anrede === 'Herr' ? 'Herr' : profile.anrede === 'Frau' ? 'Frau' : '';
      return `${anrede} ${profile.vorname} ${profile.nachname}`.trim();
    }
    return user?.email?.split('@')[0] || 'Kunde';
  };

  const userInitials = profile?.vorname && profile?.nachname
    ? `${profile.vorname[0]}${profile.nachname[0]}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'KD';

  return (
    <TooltipProvider>
      <Sidebar 
        className={`hidden md:flex border-r border-border bg-sidebar-background transition-all duration-200 ${
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
                <p className="text-xs text-muted-foreground">Kundenportal</p>
              </div>
            )}
          </div>
          
          {/* User Card */}
          {open && (
            <div className="flex items-center gap-3 p-2 mt-4 rounded-lg bg-muted/30">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-2">
          <SidebarNavContent showLabels={open} />
        </SidebarContent>
        
        {/* Footer */}
        <SidebarFooter className="border-t border-sidebar-border p-3">
          {open ? (
            <div className="space-y-3">
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
                  <p className="font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
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
