import { useMemo } from 'react';
import { useStories, useDependencies, useBugs, useObservations } from '@/store/useStore';
import { getStoryStatus, getStoryProgress, isDelayed, calculateDelayDays, formatDate } from '@/lib/storyUtils';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

function exportToCsv(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { stories } = useStories();
  const { dependencies } = useDependencies();
  const { bugs } = useBugs();
  const { observations } = useObservations();

  const journeyRows = useMemo(() => stories.map(s => {
    const storyBugs = bugs.filter(b => b.storyId === s.storyId && b.phaseNumber === s.phaseNumber);
    const storyDeps = dependencies.filter(d => d.storyId === s.storyId && d.phaseNumber === s.phaseNumber);
    const storyObs = observations.filter(o => o.storyId === s.storyId && o.phaseNumber === s.phaseNumber);
    const delay = Math.max(
      calculateDelayDays(s.devActualEndDate, s.devPlannedEndDate),
      calculateDelayDays(s.sitActualEndDate, s.sitPlannedEndDate),
      calculateDelayDays(s.uatActualEndDate, s.uatPlannedEndDate),
    );
    return { ...s, bugCount: storyBugs.length, bugsClosed: storyBugs.filter(b => b.status === 'Closed').length, depCount: storyDeps.filter(d => d.status === 'Open').length, obsCount: storyObs.length, delayDays: delay };
  }), [stories, bugs, dependencies, observations]);

  const exportJourney = () => {
    const headers = ['Story ID', 'Phase', 'Story Name', 'Priority', 'Priority Decided By', 'Req Status', 'Discussion Date', 'Dev Start', 'Dev End', 'SIT Start', 'SIT End', 'UAT Start', 'UAT End', 'Bugs Raised', 'Bugs Closed', 'Observations', 'Dependencies', 'Sign Off', 'Production Date', 'Delay Days'];
    const rows = journeyRows.map(s => [s.storyId, String(s.phaseNumber), s.storyName, s.priorityLevel, s.priorityDecidedBy, s.requirementStatus, s.discussionDateWithIT, s.devStartDate, s.devActualEndDate, s.sitStartDate, s.sitActualEndDate, s.uatStartDate, s.uatActualEndDate, String(s.bugCount), String(s.bugsClosed), String(s.obsCount), String(s.depCount), s.signOffDate, s.productionReleaseDate, String(s.delayDays)]);
    exportToCsv(headers, rows, 'journey-report.csv');
  };

  const exportBugs = () => {
    const headers = ['Story ID', 'Phase', 'Description', 'Severity', 'Status', 'Raised', 'Fixed', 'Retested'];
    const rows = bugs.map(b => [b.storyId, String(b.phaseNumber), b.bugDescription, b.severity, b.status, b.bugRaisedDate, b.bugFixedDate, b.bugRetestedDate]);
    exportToCsv(headers, rows, 'bug-report.csv');
  };

  const exportDeps = () => {
    const headers = ['Story ID', 'Phase', 'Type', 'Description', 'Team', 'Start', 'End', 'Status'];
    const rows = dependencies.map(d => [d.storyId, String(d.phaseNumber), d.dependencyType, d.dependencyDescription, d.responsibleTeam, d.startDateTime, d.endDateTime, d.status]);
    exportToCsv(headers, rows, 'dependency-report.csv');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Management journey report & exports</p>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={exportJourney} className="gap-1.5"><Download className="w-3.5 h-3.5" /> Journey Report (CSV)</Button>
        <Button variant="outline" size="sm" onClick={exportBugs} className="gap-1.5"><Download className="w-3.5 h-3.5" /> Bug Report (CSV)</Button>
        <Button variant="outline" size="sm" onClick={exportDeps} className="gap-1.5"><Download className="w-3.5 h-3.5" /> Dependency Report (CSV)</Button>
      </div>

      {/* Journey table */}
      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-card-foreground">Management Journey Report</h3>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            {['Story ID', 'Ph', 'Name', 'Priority', 'Decided By', 'Req Status', 'Dev Start', 'Dev End', 'SIT', 'UAT', 'Bugs', 'Deps', 'Prod Date', 'Delay'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {journeyRows.length === 0 ? (
              <tr><td colSpan={14} className="text-center py-12 text-muted-foreground text-sm">No data</td></tr>
            ) : journeyRows.map(s => (
              <tr key={s.id} className={`border-b border-border last:border-0 ${s.delayDays > 0 ? 'bg-rose/5' : ''}`}>
                <td className="px-3 py-2 font-mono">{s.storyId}</td>
                <td className="px-3 py-2">{s.phaseNumber}</td>
                <td className="px-3 py-2 max-w-[120px] truncate font-medium">{s.storyName}</td>
                <td className="px-3 py-2"><StatusBadge status={s.priorityLevel} /></td>
                <td className="px-3 py-2 text-muted-foreground">{s.priorityDecidedBy || '—'}</td>
                <td className="px-3 py-2"><StatusBadge status={s.requirementStatus} /></td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(s.devStartDate)}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(s.devActualEndDate)}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(s.sitActualEndDate)}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(s.uatActualEndDate)}</td>
                <td className="px-3 py-2">{s.bugCount > 0 ? `${s.bugsClosed}/${s.bugCount}` : '—'}</td>
                <td className="px-3 py-2">{s.depCount > 0 ? <span className="text-orange font-medium">{s.depCount}</span> : '—'}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(s.productionReleaseDate)}</td>
                <td className="px-3 py-2">{s.delayDays > 0 ? <span className="text-rose font-bold">{s.delayDays}d</span> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
