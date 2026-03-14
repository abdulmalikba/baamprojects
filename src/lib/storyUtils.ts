import { Story } from '@/types';

export function getStoryProgress(story: Story): number {
  if (story.productionReleaseDate) return 100;
  if (story.uatActualEndDate) return 80;
  if (story.sitActualEndDate) return 60;
  if (story.devActualEndDate) return 40;
  if (story.requirementStatus === 'Ready for Development' || story.requirementStatus === 'Requirement Freeze') return 10;
  return 0;
}

export function getStoryStatus(story: Story): string {
  if (story.productionReleaseDate) return 'Production Live';
  if (story.reUatStartDate && !story.reUatEndDate) return 'In Re-UAT';
  if (story.uatStartDate && !story.uatActualEndDate) return 'In UAT';
  if (story.sitStartDate && !story.sitActualEndDate) return 'In SIT';
  if (story.devStartDate && !story.devActualEndDate) return 'In Development';
  if (story.requirementStatus === 'Ready for Development' || story.requirementStatus === 'Requirement Freeze') return 'Ready for Dev';
  if (story.requirementStatus === 'Discussed with IT') return 'Discussed with IT';
  if (story.requirementStatus === 'Ready To Be Discussed with IT') return 'Ready for Discussion';
  if (story.requirementStatus === 'Writing in Progress') return 'Writing in Progress';
  return 'To Be Written';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Production Live': return 'bg-emerald/10 text-emerald border-emerald/20';
    case 'In Re-UAT':
    case 'In UAT': return 'bg-purple/10 text-purple border-purple/20';
    case 'In SIT': return 'bg-amber/10 text-amber border-amber/20';
    case 'In Development': return 'bg-blue/10 text-blue border-blue/20';
    case 'Ready for Dev': return 'bg-teal/10 text-teal border-teal/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Emergency': return 'bg-rose/10 text-rose border-rose/20';
    case 'Critical': return 'bg-orange/10 text-orange border-orange/20';
    case 'High': return 'bg-amber/10 text-amber border-amber/20';
    case 'Medium': return 'bg-blue/10 text-blue border-blue/20';
    case 'Low': return 'bg-emerald/10 text-emerald border-emerald/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function calculateDelayDays(actualEndDate: string, plannedEndDate: string): number {
  if (!actualEndDate || !plannedEndDate) return 0;
  const actual = new Date(actualEndDate);
  const planned = new Date(plannedEndDate);
  const diff = Math.ceil((actual.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function isDelayed(story: Story): boolean {
  if (story.devActualEndDate && story.devPlannedEndDate && calculateDelayDays(story.devActualEndDate, story.devPlannedEndDate) > 0) return true;
  if (story.sitActualEndDate && story.sitPlannedEndDate && calculateDelayDays(story.sitActualEndDate, story.sitPlannedEndDate) > 0) return true;
  if (story.uatActualEndDate && story.uatPlannedEndDate && calculateDelayDays(story.uatActualEndDate, story.uatPlannedEndDate) > 0) return true;
  return false;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
}
