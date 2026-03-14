import { useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useStories } from '@/store/useStore';
import { Story, PriorityLevel, StoryType, RequirementStatus } from '@/types';
import { getStoryStatus, getStoryProgress, getStatusColor, generateId, formatDate } from '@/lib/storyUtils';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const emptyStory = (): Story => ({
  id: generateId(),
  storyId: '', phaseNumber: 1, phaseDescription: '', storyName: '', description: '',
  projectName: '', module: '', type: 'Story', priorityLevel: 'Medium',
  priorityDecidedBy: '', priorityDecisionDate: '', assignedDeveloper: '', assignedTester: '', businessOwner: '',
  requirementStatus: 'To Be Written', requirementWritingStartDate: '', requirementReadyDate: '',
  discussionDateWithIT: '', businessApprovalDate: '', discussionNotes: '',
  devStartDate: '', devPlannedEndDate: '', devActualEndDate: '',
  sitStartDate: '', sitPlannedEndDate: '', sitActualEndDate: '',
  uatStartDate: '', uatPlannedEndDate: '', uatActualEndDate: '',
  reUatStartDate: '', reUatEndDate: '', signOffDate: '', productionReleaseDate: '',
  dateRevisions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

export default function StoriesPage() {
  const { stories, addStory, updateStory, deleteStory } = useStories();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Story | null>(null);
  const [tab, setTab] = useState<'basic' | 'requirement' | 'dates'>('basic');

  const filtered = stories.filter(s =>
    s.storyId.toLowerCase().includes(search.toLowerCase()) ||
    s.storyName.toLowerCase().includes(search.toLowerCase()) ||
    s.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(emptyStory()); setTab('basic'); setDialogOpen(true); };
  const openEdit = (s: Story) => { setEditing({ ...s }); setTab('basic'); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing || !editing.storyId || !editing.storyName) return;
    editing.updatedAt = new Date().toISOString();
    if (stories.find(s => s.id === editing.id)) {
      updateStory(editing);
    } else {
      addStory(editing);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const update = (field: keyof Story, value: any) => {
    if (editing) setEditing({ ...editing, [field]: value });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stories</h1>
          <p className="text-sm text-muted-foreground mt-1">{stories.length} stories tracked</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Story
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search stories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Story ID', 'Ph', 'Name', 'Project', 'Status', 'Progress', 'Priority', 'Developer', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No stories found</td></tr>
            ) : filtered.map(story => {
              const status = getStoryStatus(story);
              return (
                <tr key={story.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => openEdit(story)}>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium">{story.storyId}</td>
                  <td className="px-4 py-2.5">{story.phaseNumber}</td>
                  <td className="px-4 py-2.5 font-medium max-w-[180px] truncate">{story.storyName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{story.projectName || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={status} colorClass={getStatusColor(status)} /></td>
                  <td className="px-4 py-2.5 w-28"><ProgressBar value={getStoryProgress(story)} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={story.priorityLevel} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{story.assignedDeveloper || '—'}</td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteStory(story.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing && stories.find(s => s.id === editing.id) ? 'Edit Story' : 'Add Story'}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 bg-muted p-1 rounded-md">
                {(['basic', 'requirement', 'dates'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${tab === t ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground'}`}>
                    {t === 'basic' ? 'Basic Info' : t === 'requirement' ? 'Requirement' : 'Dates'}
                  </button>
                ))}
              </div>

              {tab === 'basic' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Story ID *</Label><Input value={editing.storyId} onChange={e => update('storyId', e.target.value)} placeholder="e.g. CR-1024" /></div>
                  <div><Label className="text-xs">Phase Number</Label><Input type="number" min={1} value={editing.phaseNumber} onChange={e => update('phaseNumber', parseInt(e.target.value) || 1)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Story Name *</Label><Input value={editing.storyName} onChange={e => update('storyName', e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea value={editing.description} onChange={e => update('description', e.target.value)} rows={2} /></div>
                  <div><Label className="text-xs">Project Name</Label><Input value={editing.projectName} onChange={e => update('projectName', e.target.value)} /></div>
                  <div><Label className="text-xs">Module</Label><Input value={editing.module} onChange={e => update('module', e.target.value)} /></div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={editing.type} onValueChange={v => update('type', v as StoryType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{['Story', 'CR', 'Task'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Select value={editing.priorityLevel} onValueChange={v => update('priorityLevel', v as PriorityLevel)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{['Low', 'Medium', 'High', 'Critical', 'Emergency'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Priority Decided By</Label><Input value={editing.priorityDecidedBy} onChange={e => update('priorityDecidedBy', e.target.value)} /></div>
                  <div><Label className="text-xs">Priority Decision Date</Label><Input type="date" value={editing.priorityDecisionDate} onChange={e => update('priorityDecisionDate', e.target.value)} /></div>
                  <div><Label className="text-xs">Assigned Developer</Label><Input value={editing.assignedDeveloper} onChange={e => update('assignedDeveloper', e.target.value)} /></div>
                  <div><Label className="text-xs">Assigned Tester</Label><Input value={editing.assignedTester} onChange={e => update('assignedTester', e.target.value)} /></div>
                  <div><Label className="text-xs">Business Owner</Label><Input value={editing.businessOwner} onChange={e => update('businessOwner', e.target.value)} /></div>
                  <div><Label className="text-xs">Phase Description</Label><Input value={editing.phaseDescription} onChange={e => update('phaseDescription', e.target.value)} /></div>
                </div>
              )}

              {tab === 'requirement' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Requirement Status</Label>
                    <Select value={editing.requirementStatus} onValueChange={v => update('requirementStatus', v as RequirementStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['To Be Written', 'Writing in Progress', 'Ready To Be Discussed with IT', 'Discussed with IT', 'Requirement Freeze', 'Ready for Development'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Writing Start Date</Label><Input type="date" value={editing.requirementWritingStartDate} onChange={e => update('requirementWritingStartDate', e.target.value)} /></div>
                  <div><Label className="text-xs">Requirement Ready Date</Label><Input type="date" value={editing.requirementReadyDate} onChange={e => update('requirementReadyDate', e.target.value)} /></div>
                  <div><Label className="text-xs">Discussion Date with IT</Label><Input type="date" value={editing.discussionDateWithIT} onChange={e => update('discussionDateWithIT', e.target.value)} /></div>
                  <div><Label className="text-xs">Business Approval Date</Label><Input type="date" value={editing.businessApprovalDate} onChange={e => update('businessApprovalDate', e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Discussion Notes</Label><Textarea value={editing.discussionNotes} onChange={e => update('discussionNotes', e.target.value)} rows={3} /></div>
                </div>
              )}

              {tab === 'dates' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Development</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">Dev Start</Label><Input type="date" value={editing.devStartDate} onChange={e => update('devStartDate', e.target.value)} /></div>
                    <div><Label className="text-xs">Dev Planned End</Label><Input type="date" value={editing.devPlannedEndDate} onChange={e => update('devPlannedEndDate', e.target.value)} /></div>
                    <div><Label className="text-xs">Dev Actual End</Label><Input type="date" value={editing.devActualEndDate} onChange={e => update('devActualEndDate', e.target.value)} /></div>
                  </div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SIT</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">SIT Start</Label><Input type="date" value={editing.sitStartDate} onChange={e => update('sitStartDate', e.target.value)} /></div>
                    <div><Label className="text-xs">SIT Planned End</Label><Input type="date" value={editing.sitPlannedEndDate} onChange={e => update('sitPlannedEndDate', e.target.value)} /></div>
                    <div><Label className="text-xs">SIT Actual End</Label><Input type="date" value={editing.sitActualEndDate} onChange={e => update('sitActualEndDate', e.target.value)} /></div>
                  </div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">UAT</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">UAT Start</Label><Input type="date" value={editing.uatStartDate} onChange={e => update('uatStartDate', e.target.value)} /></div>
                    <div><Label className="text-xs">UAT Planned End</Label><Input type="date" value={editing.uatPlannedEndDate} onChange={e => update('uatPlannedEndDate', e.target.value)} /></div>
                    <div><Label className="text-xs">UAT Actual End</Label><Input type="date" value={editing.uatActualEndDate} onChange={e => update('uatActualEndDate', e.target.value)} /></div>
                  </div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Re-UAT & Release</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Re-UAT Start</Label><Input type="date" value={editing.reUatStartDate} onChange={e => update('reUatStartDate', e.target.value)} /></div>
                    <div><Label className="text-xs">Re-UAT End</Label><Input type="date" value={editing.reUatEndDate} onChange={e => update('reUatEndDate', e.target.value)} /></div>
                    <div><Label className="text-xs">Sign-off Date</Label><Input type="date" value={editing.signOffDate} onChange={e => update('signOffDate', e.target.value)} /></div>
                    <div><Label className="text-xs">Production Release</Label><Input type="date" value={editing.productionReleaseDate} onChange={e => update('productionReleaseDate', e.target.value)} /></div>
                  </div>
                </div>
              )}

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
