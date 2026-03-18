import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useBugs } from '@/store/useStore';
import { Bug, BugSeverity, BugStatus } from '@/types';
import { generateId, formatDate } from '@/lib/storyUtils';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';
import StorySelector from '@/components/StorySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bug as BugIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

const emptyBug = (): Bug => ({
  id: generateId(), storyId: '', phaseNumber: 1, storyName: '',
  bugDescription: '', severity: 'Medium', status: 'Open',
  bugRaisedDate: new Date().toISOString().split('T')[0], bugFixedDate: '', bugRetestedDate: '',
});

export default function BugsPage() {
  const { bugs, addBug, updateBug, deleteBug } = useBugs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bug | null>(null);

  const openBugs = bugs.filter(b => b.status === 'Open').length;
  const closedBugs = bugs.filter(b => b.status === 'Closed').length;

  const openNew = () => { setEditing(emptyBug()); setDialogOpen(true); };
  const openEdit = (b: Bug) => { setEditing({ ...b }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    if (bugs.find(b => b.id === editing.id)) updateBug(editing);
    else addBug(editing);
    setDialogOpen(false);
  };

  const update = (field: keyof Bug, value: any) => {
    if (editing) setEditing({ ...editing, [field]: value });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">UAT Bugs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage UAT bugs</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Log Bug</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Bugs" value={bugs.length} icon={<BugIcon className="w-4 h-4" />} />
        <StatCard title="Open" value={openBugs} icon={<AlertCircle className="w-4 h-4" />} color="bg-rose/10 text-rose" />
        <StatCard title="Closed" value={closedBugs} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-emerald/10 text-emerald" />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Story ID', 'Ph', 'Story Name', 'Bug Description', 'Severity', 'Status', 'Raised', 'Fixed', ''].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {bugs.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No bugs logged</td></tr>
            ) : bugs.map(bug => (
              <tr key={bug.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => openEdit(bug)}>
                <td className="px-4 py-2.5 font-mono text-xs">{bug.storyId}</td>
                <td className="px-4 py-2.5">{bug.phaseNumber}</td>
                <td className="px-4 py-2.5 max-w-[200px] truncate">{bug.bugDescription}</td>
                <td className="px-4 py-2.5"><StatusBadge status={bug.severity} /></td>
                <td className="px-4 py-2.5"><StatusBadge status={bug.status} /></td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(bug.bugRaisedDate)}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(bug.bugFixedDate)}</td>
                <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteBug(bug.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing && bugs.find(b => b.id === editing.id) ? 'Edit' : 'Log'} Bug</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <StorySelector
                value={editing.storyId ? `${editing.storyId}|${editing.phaseNumber}` : ''}
                onChange={(storyId, phaseNumber, storyName) => setEditing({ ...editing, storyId, phaseNumber, storyName })}
              />
              <div className="col-span-2"><Label className="text-xs">Bug Description</Label><Textarea value={editing.bugDescription} onChange={e => update('bugDescription', e.target.value)} rows={2} /></div>
              <div>
                <Label className="text-xs">Severity</Label>
                <Select value={editing.severity} onValueChange={v => update('severity', v as BugSeverity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Low', 'Medium', 'High', 'Critical'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={editing.status} onValueChange={v => update('status', v as BugStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Open', 'Fixed', 'Retested', 'Closed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Raised Date</Label><Input type="date" value={editing.bugRaisedDate} onChange={e => update('bugRaisedDate', e.target.value)} /></div>
              <div><Label className="text-xs">Fixed Date</Label><Input type="date" value={editing.bugFixedDate} onChange={e => update('bugFixedDate', e.target.value)} /></div>
              <div><Label className="text-xs">Retested Date</Label><Input type="date" value={editing.bugRetestedDate} onChange={e => update('bugRetestedDate', e.target.value)} /></div>
              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
