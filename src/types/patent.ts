// Defines the type for patent data
export interface Patent {
  id: string;
  title: string;
  abstract: string;
  inventors: string[];
  inventorsText: string;
  publicationDate: string;
  relevanceScore: number;
  assignee?: string;
  status?: 'Active' | 'Pending' | 'Expired';
  cpcCodes?: string[];
  claims?: string[];
}