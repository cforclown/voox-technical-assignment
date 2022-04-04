import { FindIssuesPayload, FindIssuesResult } from '.';
import { IssuesDao } from './issues.dao';
import { Issue } from './issues.types';

export class IssuesService {
  issuesDao: IssuesDao;

  constructor ({ issuesDao }: { issuesDao: IssuesDao; }) {
    this.issuesDao = issuesDao;
  }

  getAll (): Promise<Issue[]> {
    return this.issuesDao.getAll();
  }

  find (payload: FindIssuesPayload): Promise<FindIssuesResult> {
    return this.issuesDao.find(payload);
  }

  get (issueId: string): Promise<Issue> {
    return this.issuesDao.get(issueId);
  }

  async isExists (issueId: string): Promise<boolean> {
    return !!(await this.issuesDao.get(issueId));
  }

  create (payload: Omit<Issue, '_id'>): Promise<Issue> {
    return this.issuesDao.create(payload);
  }

  update (payload: Issue): Promise<Issue> {
    return this.issuesDao.update(payload);
  }

  delete (issueId: string): Promise<Issue> {
    return this.issuesDao.delete(issueId);
  }
}
