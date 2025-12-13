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

interface NavItemType {
  title: string;
  url: string;
  icon: typeof FolderOpen;
  tabParam: string | null;
  external?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItemType[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Navigation',
    items: [
      { title: 'Meine Galerien', url: '/', icon: FolderOpen, tabParam: null },
      { title: 'Staging anfordern', url: '/', icon: Sofa, tabParam: 'staging' },
      { title: 'Virtuelle Bearbeitung', url: '/virtuelle-bearbeitung', icon: Sparkles, tabParam: null },
      { title: 'Shooting buchen', url: '/buchung', icon: Camera, tabParam: null, external: true },
    ],
  },
  {
    label: 'Konto',
    items: [
      { title: 'Einstellungen', url: '/', icon: Settings, tabParam: 'settings' },
      { title: 'Feedback geben', url: '/feature-anfrage', icon: Lightbulb, tabParam: null },
    ],
  },
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
        <SidebarGroup key={group.label} className="py-1">
          {showLabels && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-0.5">
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavItemComponent 
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
  const { siteName, logoIconUrl, supportEmail } = useBranding();
  const { data: profile } = useClientProfile(user?.email);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/auth');
  };

  const handleNavigateToSettings = () => {
    setIsOpen(false);
    navigate('/?tab=settings');
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
          <div className="flex items-center justify-between mb-3">
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
          
          {/* User Card - Klickbar für Einstellungen */}
          <button 
            onClick={handleNavigateToSettings}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 w-full hover:bg-muted/60 transition-colors text-left group"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{getDisplayName()}</p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">{user?.email}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-3 py-3 overflow-y-auto">
          <TooltipProvider>
            <SidebarNavContent onItemClick={() => setIsOpen(false)} showLabels={true} />
          </TooltipProvider>
        </div>
        
        {/* Footer */}
        <div className="border-t border-border p-3 mt-auto">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 justify-center h-9 text-xs"
              onClick={() => {
                setIsOpen(false);
                window.open(`mailto:${supportEmail}`, '_blank');
              }}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Hilfe
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 justify-center text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-xs"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Abmelden
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ClientSidebar() {
  const { open } = useSidebar();
  const { user, signOut } = useAuth();
  const { siteName, logoIconUrl, supportEmail } = useBranding();
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
        <SidebarHeader className="border-b border-sidebar-border px-3 py-2">
          <div className="flex items-center gap-2">
            {logoIconUrl ? (
              <img src={logoIconUrl} alt={siteName} className="w-8 h-8 rounded-lg shrink-0 object-contain" />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
                <Camera className="h-4 w-4" />
              </div>
            )}
            {open && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate leading-tight">{siteName}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Kundenportal</p>
              </div>
            )}
          </div>
          
          {/* User Card - Klickbar für Einstellungen */}
          {open && (
            <button
              onClick={() => navigate('/?tab=settings')}
              className="flex items-center gap-2 p-1.5 mt-2 rounded-md bg-muted/30 w-full hover:bg-muted/50 transition-colors text-left group"
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate leading-tight">{getDisplayName()}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">{user?.email}</p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          )}
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-1">
          <SidebarNavContent showLabels={open} />
        </SidebarContent>
        
        {/* Footer */}
        <SidebarFooter className="border-t border-sidebar-border p-2">
          {open ? (
            <div className="flex gap-1">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => window.open(`mailto:${supportEmail}`, '_blank')}
                    >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">E-Mail an Support</TooltipContent>
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
                <TooltipContent side="top">Abmelden</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate('/?tab=settings')}
                    className="rounded-full transition-transform hover:scale-105"
                  >
                    <Avatar className="h-7 w-7 cursor-pointer">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-primary mt-1">Klicken für Einstellungen</p>
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
