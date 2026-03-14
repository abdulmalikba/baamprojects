import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Link2, Bug, Eye, Archive, FileText, BarChart3,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Stories', icon: BookOpen, path: '/stories' },
  { label: 'Dependencies', icon: Link2, path: '/dependencies' },
  { label: 'Bugs', icon: Bug, path: '/bugs' },
  { label: 'Observations', icon: Eye, path: '/observations' },
  { label: 'Backlog', icon: Archive, path: '/backlog' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-slide-in">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BA</span>
            </div>
            <span className="font-semibold text-sidebar-accent-foreground text-sm tracking-tight">BA Tracker</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">BA</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
