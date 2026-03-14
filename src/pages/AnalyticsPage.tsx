import { useMemo } from 'react';
import { useStories } from '@/store/useStore';
import { getStoryStatus, getStoryProgress, daysBetween } from '@/lib/storyUtils';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { BookOpen, Rocket, Code2, MessageSquare, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { stories } = useStories();

  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = stories.filter(s => {
      const d = new Date(s.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const written = stories.filter(s => s.requirementStatus !== 'To Be Written' && s.requirementStatus !== 'Writing in Progress');
    const inDev = stories.filter(s => s.devStartDate);
    const released = stories.filter(s => s.productionReleaseDate);
    const waitingDiscussion = stories.filter(s => s.requirementStatus === 'Ready To Be Discussed with IT');

    // Writing time calculation
    const writingTimes = stories
      .filter(s => s.requirementWritingStartDate && s.requirementReadyDate)
      .map(s => daysBetween(s.requirementWritingStartDate, s.requirementReadyDate));
    const avgWriting = writingTimes.length ? Math.round(writingTimes.reduce((a, b) => a + b, 0) / writingTimes.length) : 0;

    // Story aging
    const aging = stories.filter(s => !s.productionReleaseDate).map(s => {
      const status = getStoryStatus(s);
      const latestDate = s.uatStartDate || s.sitStartDate || s.devStartDate || s.requirementWritingStartDate || s.createdAt;
      const days = daysBetween(latestDate, now.toISOString());
      return { ...s, currentStatus: status, daysInStage: days };
    }).sort((a, b) => b.daysInStage - a.daysInStage);

    return { thisMonth: thisMonth.length, written: written.length, inDev: inDev.length, released: released.length, waitingDiscussion: waitingDiscussion.length, avgWriting, aging };
  }, [stories]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { created: number; released: number }> = {};
    stories.forEach(s => {
      const m = new Date(s.createdAt).toLocaleDateString('en', { month: 'short', year: '2-digit' });
      if (!months[m]) months[m] = { created: 0, released: 0 };
      months[m].created++;
      if (s.productionReleaseDate) {
        const rm = new Date(s.productionReleaseDate).toLocaleDateString('en', { month: 'short', year: '2-digit' });
        if (!months[rm]) months[rm] = { created: 0, released: 0 };
        months[rm].released++;
      }
    });
    return Object.entries(months).map(([month, v]) => ({ month, ...v }));
  }, [stories]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">BA Productivity Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Your performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Created This Month" value={metrics.thisMonth} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard title="Requirements Written" value={metrics.written} icon={<MessageSquare className="w-4 h-4" />} color="bg-teal/10 text-teal" />
        <StatCard title="In Development" value={metrics.inDev} icon={<Code2 className="w-4 h-4" />} color="bg-blue/10 text-blue" />
        <StatCard title="Released" value={metrics.released} icon={<Rocket className="w-4 h-4" />} color="bg-emerald/10 text-emerald" />
        <StatCard title="Avg Writing Time" value={`${metrics.avgWriting}d`} icon={<Clock className="w-4 h-4" />} color="bg-amber/10 text-amber" />
      </div>

      {/* Monthly chart */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Monthly Delivery Trend</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="created" fill="hsl(199,89%,38%)" name="Created" radius={[4, 4, 0, 0]} />
              <Bar dataKey="released" fill="hsl(152,69%,40%)" name="Released" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
        )}
      </div>

      {/* Story aging */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-card-foreground">Story Aging Analysis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Stories not yet in production, sorted by days in current stage</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {['Story ID', 'Phase', 'Name', 'Current Status', 'Days in Stage'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {metrics.aging.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">All stories are in production!</td></tr>
              ) : metrics.aging.slice(0, 15).map(s => (
                <tr key={s.id} className={`border-b border-border last:border-0 ${s.daysInStage > 10 ? 'bg-rose/5' : s.daysInStage > 5 ? 'bg-amber/5' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs">{s.storyId}</td>
                  <td className="px-4 py-2.5">{s.phaseNumber}</td>
                  <td className="px-4 py-2.5 font-medium">{s.storyName}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={s.currentStatus} /></td>
                  <td className="px-4 py-2.5 font-mono font-bold">{s.daysInStage}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
