import { ReactNode } from 'react';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Calendar, Inbox, Users, Zap, Home, BookOpen, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
interface LayoutProps {
  children: ReactNode;
}
const navItems = [{
  to: '/dashboard',
  icon: LayoutDashboard,
  label: 'Dashboard'
}, {
  to: '/calendar',
  icon: Calendar,
  label: 'Calendar'
}, {
  to: '/inbox',
  icon: Inbox,
  label: 'Inbox'
}, {
  to: '/crews',
  icon: Users,
  label: 'Crews'
}, {
  to: '/automation',
  icon: Zap,
  label: 'Automation'
}, {
  to: '/properties',
  icon: Home,
  label: 'Properties'
}, {
  to: '/bookings',
  icon: BookOpen,
  label: 'Bookings'
}, {
  to: '/settings',
  icon: Settings,
  label: 'Settings'
}];
export function Layout({
  children
}: LayoutProps) {
  const navigate = useNavigate();
  const handleLogout = () => {
    // TODO: INTEGRATION STUB: Implement Supabase signOut
    navigate('/auth');
  };
  return <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
        <div className="flex items-center h-16 px-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">MOMA.HOUSE CRM</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavLink key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" activeClassName="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>)}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map(item => <NavLink key={item.to} to={item.to} className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground" activeClassName="text-primary">
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>)}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </main>
    </div>;
}