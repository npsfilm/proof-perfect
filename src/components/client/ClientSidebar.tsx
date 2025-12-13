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
  Camera,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Mail
} from 'lucide-react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NavItemType {
  title: string;
  url: string;
  icon: typeof FolderOpen;
  tabParam: string | null;
  external?: boolean;
}

// Hauptnavigation (oben)
const mainNavItems: NavItemType[] = [
  { title: 'Meine Galerien', url: '/', icon: FolderOpen, tabParam: null },
  { title: 'Staging anfordern', url: '/', icon: Sofa, tabParam: 'staging' },
  { title: 'Virtuelle Bearbeitung', url: '/virtuelle-bearbeitung', icon: Sparkles, tabParam: null },
  { title: 'Shooting buchen', url: '/buchung', icon: Camera, tabParam: null, external: true },
];

// Sekundäre Navigation (Footer, vor User-Card)
const footerNavItems: NavItemType[] = [
  { title: 'Feedback geben', url: '/feature-anfrage', icon: Lightbulb, tabParam: null },
  { title: 'Einstellungen', url: '/', icon: Settings, tabParam: 'settings' },
];

interface NavItemComponentProps {
  item: NavItemType;
  isActive: boolean;
  showLabel: boolean;
  onItemClick?: () => void;
}

function NavItemComponent({ item, isActive, showLabel, onItemClick }: NavItemComponentProps) {
  const getItemUrl = () => {
    if (item.tabParam) {
      return `${item.url}?tab=${item.tabParam}`;
    }
    return item.url;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (item.external) {
      e.preventDefault();
      window.location.href = item.url;
    }
    onItemClick?.();
  };

  const content = (
    <NavLink
      to={getItemUrl()}
      onClick={handleClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-muted text-foreground font-medium' 
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {showLabel && <span className="text-sm">{item.title}</span>}
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

function useNavItemActive() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const isItemActive = (item: NavItemType) => {
    if (item.tabParam) {
      return currentTab === item.tabParam;
    }
    if (item.url === '/') {
      return location.pathname === '/' && !currentTab;
    }
    return location.pathname === item.url;
  };

  return { isItemActive };
}

export function MobileClientNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { siteName, logoIconUrl, supportEmail } = useBranding();
  const { data: profile } = useClientProfile(user?.email);
  const navigate = useNavigate();
  const { isItemActive } = useNavItemActive();

  const handleSignOut = async () => {
    setIsOpen(false);
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
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Hauptnavigation für die mobile Ansicht</SheetDescription>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logoIconUrl ? (
                <img src={logoIconUrl} alt={siteName} className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                  <Camera className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm leading-tight">{siteName}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Kundenportal</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Hauptnavigation */}
        <div className="flex-1 px-3 py-3 overflow-y-auto">
          <TooltipProvider>
            <SidebarMenu className="space-y-0.5">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavItemComponent 
                      item={item} 
                      isActive={isItemActive(item)}
                      showLabel={true}
                      onItemClick={() => setIsOpen(false)}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </TooltipProvider>
        </div>
        
        {/* Footer */}
        <div className="border-t border-border p-3 mt-auto space-y-3">
          {/* Sekundäre Navigation */}
          <div className="space-y-0.5">
            {footerNavItems.map((item) => (
              <NavItemComponent 
                key={item.title}
                item={item} 
                isActive={isItemActive(item)}
                showLabel={true}
                onItemClick={() => setIsOpen(false)}
              />
            ))}
            {/* Hilfe Link */}
            <button
              onClick={() => {
                setIsOpen(false);
                window.open(`mailto:${supportEmail}`, '_blank');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">Hilfe</span>
            </button>
          </div>
          
          {/* User Card */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{getDisplayName()}</p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">{user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ClientSidebar() {
  const { open, toggleSidebar } = useSidebar();
  const { user, signOut } = useAuth();
  const { siteName, logoIconUrl, supportEmail } = useBranding();
  const { data: profile } = useClientProfile(user?.email);
  const navigate = useNavigate();
  const { isItemActive } = useNavItemActive();

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
          open ? 'w-60' : 'w-[52px]'
        }`} 
        collapsible="icon"
      >
        {/* Header - nur Logo + Collapse Button */}
        <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logoIconUrl ? (
                <img src={logoIconUrl} alt={siteName} className="w-7 h-7 rounded-lg shrink-0 object-contain" />
              ) : (
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground shrink-0">
                  <Camera className="h-3.5 w-3.5" />
                </div>
              )}
              {open && (
                <span className="font-semibold text-sm text-foreground">{siteName}</span>
              )}
            </div>
            {open && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={toggleSidebar}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>
        
        {/* Hauptnavigation */}
        <SidebarContent className="px-2 py-2">
          <SidebarMenu className="space-y-0.5">
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="p-0">
                  <NavItemComponent 
                    item={item} 
                    isActive={isItemActive(item)}
                    showLabel={open}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        {/* Footer - Sekundäre Nav + User Card */}
        <SidebarFooter className="border-t border-sidebar-border p-2 space-y-2">
          {/* Sekundäre Navigation */}
          <div className="space-y-0.5">
            {footerNavItems.map((item) => (
              <SidebarMenuItem key={item.title} className="list-none">
                <SidebarMenuButton asChild className="p-0">
                  <NavItemComponent 
                    item={item} 
                    isActive={isItemActive(item)}
                    showLabel={open}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {/* Hilfe */}
            {open ? (
              <button
                onClick={() => window.open(`mailto:${supportEmail}`, '_blank')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full"
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">Hilfe</span>
              </button>
            ) : (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => window.open(`mailto:${supportEmail}`, '_blank')}
                    className="flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">E-Mail an Support</TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* User Card */}
          {open ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{getDisplayName()}</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">{user?.email}</p>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Abmelden</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button className="rounded-full">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
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
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3.5 w-3.5" />
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
