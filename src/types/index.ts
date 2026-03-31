export type RequestType = 'BC' | 'MABC' | 'EBREED';
export type RequestStatus = 'Draft' | 'Submitted' | 'InReview' | 'Converted' | 'Rejected';
export type ProjectStage = 'Initiated' | 'Sowing' | 'Crossing' | 'Transplant' | 'Selfing' | 'Completed';

export interface ProjectRequest {
  id: string;
  title: string;
  crop: string;
  requestType: RequestType;
  requestedBy: string;
  parentLine: string;
  traitOfInterest: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectId: string;
  projectRequestId: string;
  owner: string;
  stage: ProjectStage;
  createdAt: string;
  updatedAt: string;
  requestTitle?: string;
  crop?: string;
  requestType?: RequestType;
}

export interface SowingList {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  items: SowingListItem[];
}
export interface SowingListItem {
  id: string;
  sowingListId: string;
  material: string;
  quantity: number;
  location: string;
}

export interface CrossingList {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  items: CrossingListItem[];
}
export interface CrossingListItem {
  id: string;
  crossingListId: string;
  female: string;
  male: string;
  plannedCount: number;
}

export interface TransplantList {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  items: TransplantListItem[];
}
export interface TransplantListItem {
  id: string;
  transplantListId: string;
  fromLocation: string;
  toLocation: string;
  count: number;
}


export interface SelfingList {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  items: SelfingListItem[];
}
export interface SelfingListItem {
  id: string;
  selfingListId: string;
  plant: string;
  plannedCount: number;
}


export interface DashboardCounts {
  projectRequests: number;
  projects: number;
}
