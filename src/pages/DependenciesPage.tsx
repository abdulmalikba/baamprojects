import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDependencies } from '@/store/useStore';
import { Dependency, DependencyType, DependencyStatus } from '@/types';
import { generateId, formatDate, daysBetween } from '@/lib/storyUtils';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';
import StorySelector from '@/components/StorySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const depTypes: DependencyType[] = ['Requirement Clarity Pending', 'Dependency on Other Project', 'Vendor Dependency', 'API / Integration Dependency', 'Data Source Dependency', 'Environment Issue', 'Business Approval Pending', 'Other'];

const emptyDep = (): Dependency => ({
  id: generateId(), storyId: '', phaseNumber: 1, storyName: '',
  dependencyType: 'Other', dependencyDescription: '', raisedBy: '',
  responsibleTeam: '', startDateTime: '', endDateTime: '', status: 'Open',
});

export default function DependenciesPage() {
  const { dependencies, addDependency, updateDependency, deleteDependency } = useDependencies();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dependency | null>(null);

  const open = dependencies.filter(d => d.status === 'Open').length;
  const resolved = dependencies.filter(d => d.status === 'Resolved').length;

  const openNew = () => { setEditing(emptyDep()); setDialogOpen(true); };
  const openEdit = (d: Dependency) => { setEditing({ ...d }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    if (dependencies.find(d => d.id === editing.id)) updateDependency(editing);
    else addDependency(editing);
    setDialogOpen(false);
  };

  const update = (field: keyof Dependency, value: any) => {
    if (editing) setEditing({ ...editing, [field]: value });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dependencies</h1>
          <p className="text-sm text-muted-foreground mt-1">Track blockers and dependencies</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Dependency</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total" value={dependencies.length} icon={<Link2 className="w-4 h-4" />} />
        <StatCard title="Open" value={open} icon={<AlertTriangle className="w-4 h-4" />} color="bg-orange/10 text-orange" />
        <StatCard title="Resolved" value={resolved} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-emerald/10 text-emerald" />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Story ID', 'Ph', 'Story Name', 'Type', 'Description', 'Team', 'Duration', 'Status', ''].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {dependencies.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No dependencies tracked</td></tr>
            ) : dependencies.map(dep => (
              <tr key={dep.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => openEdit(dep)}>
                <td className="px-4 py-2.5 font-mono text-xs">{dep.storyId}</td>
                <td className="px-4 py-2.5">{dep.phaseNumber}</td>
                <td className="px-4 py-2.5 max-w-[150px] truncate">{dep.storyName || '—'}</td>
                <td className="px-4 py-2.5 text-xs">{dep.dependencyType}</td>
                <td className="px-4 py-2.5 max-w-[200px] truncate">{dep.dependencyDescription}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{dep.responsibleTeam || '—'}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{dep.startDateTime && dep.endDateTime ? `${daysBetween(dep.startDateTime, dep.endDateTime)}d` : '—'}</td>
                <td className="px-4 py-2.5"><StatusBadge status={dep.status} /></td>
                <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteDependency(dep.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing && dependencies.find(d => d.id === editing.id) ? 'Edit' : 'Add'} Dependency</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <StorySelector
                value={editing.storyId ? `${editing.storyId}|${editing.phaseNumber}` : ''}
                onChange={(storyId, phaseNumber, storyName) => setEditing({ ...editing, storyId, phaseNumber, storyName })}
              />
              <div className="col-span-2">
                <Label className="text-xs">Type</Label>
                <Select value={editing.dependencyType} onValueChange={v => update('dependencyType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{depTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea value={editing.dependencyDescription} onChange={e => update('dependencyDescription', e.target.value)} rows={2} /></div>
              <div><Label className="text-xs">Raised By</Label><Input value={editing.raisedBy} onChange={e => update('raisedBy', e.target.value)} /></div>
              <div><Label className="text-xs">Responsible Team</Label><Input value={editing.responsibleTeam} onChange={e => update('responsibleTeam', e.target.value)} /></div>
              <div><Label className="text-xs">Start Date</Label><Input type="date" value={editing.startDateTime} onChange={e => update('startDateTime', e.target.value)} /></div>
              <div><Label className="text-xs">End Date</Label><Input type="date" value={editing.endDateTime} onChange={e => update('endDateTime', e.target.value)} /></div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={editing.status} onValueChange={v => update('status', v as DependencyStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent>
                </Select>
              </div>
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
