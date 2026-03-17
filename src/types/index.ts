export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency';
export type StoryType = 'Story' | 'CR' | 'Task';
export type RequirementStatus = 'To Be Written' | 'Writing in Progress' | 'Ready To Be Discussed with IT' | 'Discussed with IT' | 'Requirement Freeze' | 'Ready for Development';
export type DependencyType = 'Requirement Clarity Pending' | 'Dependency on Other Project' | 'Vendor Dependency' | 'API / Integration Dependency' | 'Data Source Dependency' | 'Environment Issue' | 'Business Approval Pending' | 'Other';
export type DependencyStatus = 'Open' | 'Resolved';
export type BugSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BugStatus = 'Open' | 'Fixed' | 'Retested' | 'Closed';
export type ObservationStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type BacklogCategory = 'Compliance' | 'Business Requirement' | 'Wishlist' | 'Emergency' | 'Future Enhancement';
export type DelayOwner = 'Development' | 'SIT' | 'UAT' | 'Business' | 'Dependency' | 'Other';

export interface DateRevision {
  id: string;
  revisionNumber: number;
  oldPlannedDate: string;
  newPlannedDate: string;
  changeDate: string;
  changedBy: string;
  changeReason: string;
  phase: 'Development' | 'SIT' | 'UAT';
}

export interface Story {
  id: string; // internal uuid
  storyId: string; // user-entered like CR-1024
  phaseNumber: number;
  phaseDescription: string;
  storyName: string;
  description: string;
  projectName: string;
  module: string;
  type: StoryType;
  priorityLevel: PriorityLevel;
  priorityDecidedBy: string;
  priorityDecisionDate: string;
  assignedDeveloper: string;
  assignedTester: string;
  businessOwner: string;

  // Requirement
  requirementStatus: RequirementStatus;
  requirementWritingStartDate: string;
  requirementReadyDate: string;
  discussionDateWithIT: string;
  businessApprovalDate: string;
  discussionNotes: string;

  // Dev dates
  devStartDate: string;
  devPlannedEndDate: string;
  devActualEndDate: string;

  // SIT dates
  sitStartDate: string;
  sitPlannedEndDate: string;
  sitActualEndDate: string;

  // UAT dates
  uatStartDate: string;
  uatPlannedEndDate: string;
  uatActualEndDate: string;

  // Re-UAT
  reUatStartDate: string;
  reUatEndDate: string;

  // Completion
  signOffDate: string;
  productionReleaseDate: string;

  // Date revisions
  dateRevisions: DateRevision[];

  createdAt: string;
  updatedAt: string;
}

export interface Dependency {
  id: string;
  storyId: string;
  phaseNumber: number;
  storyName: string;
  dependencyType: DependencyType;
  dependencyDescription: string;
  raisedBy: string;
  responsibleTeam: string;
  startDateTime: string;
  endDateTime: string;
  status: DependencyStatus;
}

export interface Bug {
  id: string;
  storyId: string;
  phaseNumber: number;
  storyName: string;
  bugDescription: string;
  severity: BugSeverity;
  status: BugStatus;
  bugRaisedDate: string;
  bugFixedDate: string;
  bugRetestedDate: string;
}

export interface Observation {
  id: string;
  storyId: string;
  phaseNumber: number;
  storyName: string;
  observationDescription: string;
  givenBy: string;
  observationGivenDate: string;
  observationResolveDate: string;
  status: ObservationStatus;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: BacklogCategory;
  priority: PriorityLevel;
  createdDate: string;
  status: 'Open' | 'In Progress' | 'Done';
}
