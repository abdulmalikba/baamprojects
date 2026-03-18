import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useObservations } from '@/store/useStore';
import { Observation, ObservationStatus } from '@/types';
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
import { Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

const emptyObs = (): Observation => ({
  id: generateId(), storyId: '', phaseNumber: 1, storyName: '',
  observationDescription: '', givenBy: '',
  observationGivenDate: new Date().toISOString().split('T')[0], observationResolveDate: '', status: 'Open',
});

export default function ObservationsPage() {
  const { observations, addObservation, updateObservation, deleteObservation } = useObservations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Observation | null>(null);

  const openObs = observations.filter(o => o.status === 'Open' || o.status === 'In Progress').length;

  const openNew = () => { setEditing(emptyObs()); setDialogOpen(true); };
  const openEdit = (o: Observation) => { setEditing({ ...o }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    if (observations.find(o => o.id === editing.id)) updateObservation(editing);
    else addObservation(editing);
    setDialogOpen(false);
  };

  const update = (field: keyof Observation, value: any) => {
    if (editing) setEditing({ ...editing, [field]: value });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Observations</h1>
          <p className="text-sm text-muted-foreground mt-1">UAT observations tracking</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Observation</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total" value={observations.length} icon={<Eye className="w-4 h-4" />} />
        <StatCard title="Open" value={openObs} icon={<AlertCircle className="w-4 h-4" />} color="bg-amber/10 text-amber" />
        <StatCard title="Resolved" value={observations.filter(o => o.status === 'Resolved' || o.status === 'Closed').length} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-emerald/10 text-emerald" />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Story ID', 'Ph', 'Story Name', 'Description', 'Given By', 'Given', 'Resolution Days', 'Status', ''].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {observations.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No observations</td></tr>
            ) : observations.map(obs => (
              <tr key={obs.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => openEdit(obs)}>
                <td className="px-4 py-2.5 font-mono text-xs">{obs.storyId}</td>
                <td className="px-4 py-2.5">{obs.phaseNumber}</td>
                <td className="px-4 py-2.5 max-w-[200px] truncate">{obs.observationDescription}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{obs.givenBy || '—'}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(obs.observationGivenDate)}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{obs.observationResolveDate ? `${daysBetween(obs.observationGivenDate, obs.observationResolveDate)}d` : '—'}</td>
                <td className="px-4 py-2.5"><StatusBadge status={obs.status} /></td>
                <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteObservation(obs.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing && observations.find(o => o.id === editing.id) ? 'Edit' : 'Add'} Observation</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <StorySelector
                value={editing.storyId ? `${editing.storyId}|${editing.phaseNumber}` : ''}
                onChange={(storyId, phaseNumber, storyName) => setEditing({ ...editing, storyId, phaseNumber, storyName })}
              />
              <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea value={editing.observationDescription} onChange={e => update('observationDescription', e.target.value)} rows={2} /></div>
              <div><Label className="text-xs">Given By</Label><Input value={editing.givenBy} onChange={e => update('givenBy', e.target.value)} /></div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={editing.status} onValueChange={v => update('status', v as ObservationStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Given Date</Label><Input type="date" value={editing.observationGivenDate} onChange={e => update('observationGivenDate', e.target.value)} /></div>
              <div><Label className="text-xs">Resolve Date</Label><Input type="date" value={editing.observationResolveDate} onChange={e => update('observationResolveDate', e.target.value)} /></div>
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
