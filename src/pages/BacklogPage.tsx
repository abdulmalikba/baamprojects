import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useBacklog } from '@/store/useStore';
import { BacklogItem, BacklogCategory, PriorityLevel } from '@/types';
import { generateId, formatDate } from '@/lib/storyUtils';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const categories: BacklogCategory[] = ['Compliance', 'Business Requirement', 'Wishlist', 'Emergency', 'Future Enhancement'];

const emptyItem = (): BacklogItem => ({
  id: generateId(), title: '', description: '', category: 'Business Requirement',
  priority: 'Medium', createdDate: new Date().toISOString().split('T')[0], status: 'Open',
});

export default function BacklogPage() {
  const { backlog, addBacklogItem, updateBacklogItem, deleteBacklogItem } = useBacklog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BacklogItem | null>(null);

  const openNew = () => { setEditing(emptyItem()); setDialogOpen(true); };
  const openEdit = (b: BacklogItem) => { setEditing({ ...b }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing || !editing.title) return;
    if (backlog.find(b => b.id === editing.id)) updateBacklogItem(editing);
    else addBacklogItem(editing);
    setDialogOpen(false);
  };

  const update = (field: keyof BacklogItem, value: any) => {
    if (editing) setEditing({ ...editing, [field]: value });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backlog</h1>
          <p className="text-sm text-muted-foreground mt-1">{backlog.length} items</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Title', 'Category', 'Priority', 'Created', 'Status', ''].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {backlog.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Backlog is empty</td></tr>
            ) : backlog.map(item => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => openEdit(item)}>
                <td className="px-4 py-2.5 font-medium">{item.title}</td>
                <td className="px-4 py-2.5"><StatusBadge status={item.category} /></td>
                <td className="px-4 py-2.5"><StatusBadge status={item.priority} /></td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(item.createdDate)}</td>
                <td className="px-4 py-2.5"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteBacklogItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing && backlog.find(b => b.id === editing.id) ? 'Edit' : 'Add'} Backlog Item</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div><Label className="text-xs">Title *</Label><Input value={editing.title} onChange={e => update('title', e.target.value)} /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={editing.description} onChange={e => update('description', e.target.value)} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={editing.category} onValueChange={v => update('category', v as BacklogCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={editing.priority} onValueChange={v => update('priority', v as PriorityLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Low', 'Medium', 'High', 'Critical', 'Emergency'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={editing.status} onValueChange={v => update('status', v as 'Open' | 'In Progress' | 'Done')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Open', 'In Progress', 'Done'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
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
