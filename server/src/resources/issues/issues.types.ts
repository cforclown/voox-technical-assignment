import { FindPayload, Pagination, PaginationSort } from '../../types';

export type IssuePriorities = 'high' | 'mid' | 'low'

export type IssueLabels = 'electrical' | 'mechanical' | 'landscape' | 'plumbing'

export interface Issue {
  _id: string;
  title: string;
  priority: IssuePriorities;
  label: IssueLabels[];
}

export type FindIssuesSortBy = 'title' | 'priority' | 'label';
export type FindIssuesPayload = FindPayload & {
  priority?: string;
  pagination: {
    sort: PaginationSort & {
      by: FindIssuesSortBy;
    };
  };
};
export type FindIssuesResult = FindIssuesPayload & {
  data: Issue[];
  pagination: Pagination & {
    pageCount: number;
  };
};

export type CreateIssuePayload = Omit<Issue, '_id'>;
