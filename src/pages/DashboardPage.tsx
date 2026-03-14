import { useMemo } from 'react';
import {
  BookOpen, AlertTriangle, Link2, Bug, TrendingUp, Clock,
  CheckCircle2, Code2, TestTube, Rocket
} from 'lucide-react';
import { useStories } from '@/store/useStore';
import { useDependencies } from '@/store/useStore';
import { useBugs } from '@/store/useStore';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import { getStoryStatus, getStoryProgress, isDelayed, getStatusColor, formatDate } from '@/lib/storyUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['hsl(199,89%,38%)', 'hsl(172,66%,40%)', 'hsl(38,92%,50%)', 'hsl(350,89%,60%)', 'hsl(217,91%,60%)', 'hsl(262,83%,58%)', 'hsl(25,95%,53%)', 'hsl(152,69%,40%)'];

export default function DashboardPage() {
  const { stories } = useStories();
  const { dependencies } = useDependencies();
  const { bugs } = useBugs();

  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    stories.forEach(s => {
      const st = getStoryStatus(s);
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });
    const delayed = stories.filter(isDelayed).length;
    const blocked = dependencies.filter(d => d.status === 'Open').length;
    const openBugs = bugs.filter(b => b.status === 'Open' || b.status === 'Fixed').length;

    return { statusCounts, delayed, blocked, openBugs, total: stories.length };
  }, [stories, dependencies, bugs]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach(s => { counts[s.priorityLevel] = (counts[s.priorityLevel] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stories]);

  const statusData = useMemo(() => {
    return Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }));
  }, [stats.statusCounts]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all stories and project health</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Stories" value={stats.total} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard title="In Development" value={stats.statusCounts['In Development'] || 0} icon={<Code2 className="w-4 h-4" />} color="bg-blue/10 text-blue" />
        <StatCard title="In SIT" value={stats.statusCounts['In SIT'] || 0} icon={<TestTube className="w-4 h-4" />} color="bg-amber/10 text-amber" />
        <StatCard title="Production Live" value={stats.statusCounts['Production Live'] || 0} icon={<Rocket className="w-4 h-4" />} color="bg-emerald/10 text-emerald" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Delayed" value={stats.delayed} icon={<AlertTriangle className="w-4 h-4" />} color="bg-rose/10 text-rose" />
        <StatCard title="Blocked" value={stats.blocked} icon={<Link2 className="w-4 h-4" />} color="bg-orange/10 text-orange" />
        <StatCard title="Open Bugs" value={stats.openBugs} icon={<Bug className="w-4 h-4" />} color="bg-purple/10 text-purple" />
        <StatCard title="In UAT" value={(stats.statusCounts['In UAT'] || 0) + (stats.statusCounts['In Re-UAT'] || 0)} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-teal/10 text-teal" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Story Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(199,89%,38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No stories yet</div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Priority Distribution</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {priorityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No stories yet</div>
          )}
        </div>
      </div>

      {/* Recent stories table */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-card-foreground">Recent Stories</h3>
        </div>
        {stories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Story ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phase</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody>
                {stories.slice(-10).reverse().map(story => {
                  const status = getStoryStatus(story);
                  const progress = getStoryProgress(story);
                  return (
                    <tr key={story.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-2.5 font-mono text-xs">{story.storyId}</td>
                      <td className="px-4 py-2.5">{story.phaseNumber}</td>
                      <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{story.storyName}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={status} colorClass={getStatusColor(status)} /></td>
                      <td className="px-4 py-2.5 w-32"><ProgressBar value={progress} /></td>
                      <td className="px-4 py-2.5"><StatusBadge status={story.priorityLevel} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No stories yet. Go to Stories to add your first one.
          </div>
        )}
      </div>
    </div>
  );
}
