import { Request } from 'express';
import { FindIssuesResult, Issue } from './issues.types';
import { IssuesService } from './issues.service';

export class IssuesController {
  private readonly issuesService: IssuesService;

  constructor ({ issuesService }: { issuesService: IssuesService; }) {
    this.issuesService = issuesService;

    this.getAll = this.getAll.bind(this);
    this.find = this.find.bind(this);
    this.get = this.get.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll (): Promise<Issue[]> {
    return this.issuesService.getAll();
  }

  async find ({ body }: Request): Promise<FindIssuesResult> {
    return this.issuesService.find(body);
  }

  async get ({ params }: Request): Promise<Issue> {
    return this.issuesService.get(params.issueId);
  }

  async create ({ body }: Request): Promise<Issue> {
    return this.issuesService.create(body);
  }

  async update ({ body }: Request): Promise<Issue> {
    return this.issuesService.update(body);
  }

  async delete ({ params }: Request): Promise<Issue> {
    return this.issuesService.delete(params.issueId);
  }
}
