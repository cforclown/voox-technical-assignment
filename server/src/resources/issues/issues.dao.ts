import { model, Model } from 'mongoose';
import { CreateIssuePayload, FindIssuesPayload, FindIssuesResult, Issue } from './issues.types';
import { RestApiException } from '../../exceptions';

export class IssuesDao {
  issuesModel: Model<Issue>;

  constructor () {
    this.issuesModel = model<Issue>('issues');
  }

  async getAll (): Promise<Issue[]> {
    return this.issuesModel.find({
      archived: false
    }).exec();
  }

  async find ({ query, priority, pagination }: FindIssuesPayload): Promise<FindIssuesResult> {
    const result = await this.issuesModel
      .aggregate([
        {
          $match: {
            $and: [
              {
                title: {
                  $regex: query ?? '',
                  $options: 'i'
                }
              },
              {
                priority: {
                  $regex: priority ?? '',
                  $options: 'i'
                }
              },
              { archived: false }
            ]
          }
        },
        {
          $sort: {
            [pagination.sort.by]: pagination.sort.order
          }
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }, { $addFields: { page: pagination.page } }],
            data: [
              { $skip: (pagination.page - 1) * pagination.limit },
              { $limit: pagination.limit }
            ]
          }
        }
      ])
      .exec();

    const data = {
      data: [],
      query,
      priority,
      pagination: {
        ...pagination,
        pageCount: 0
      }
    };

    if (result[0].metadata.length && result[0].data.length) {
      data.data = result[0].data;
      data.pagination.pageCount = Math.ceil(result[0].metadata[0].total / pagination.limit);
    }

    return data;
  }

  async get (issueId: string): Promise<Issue> {
    const issue = await this.issuesModel.findById(issueId, { archived: false }).exec();
    if (!issue) {
      throw new RestApiException('Issue not found');
    }
    return issue;
  }

  async create (payload: CreateIssuePayload): Promise<Issue> {
    const issueDoc = await this.issuesModel.create(payload);
    return issueDoc;
  }

  async update (payload: Issue): Promise<Issue> {
    const issue = await this.issuesModel.findByIdAndUpdate({ _id: payload._id, archived: false }, payload, { new: true }).exec();
    if (!issue) {
      throw new RestApiException('Issue not found');
    }
    return issue;
  }

  async delete (issueId: string): Promise<Issue> {
    const issue = await this.issuesModel.findByIdAndUpdate(issueId, { archived: true }, { new: true }).exec();
    if (!issue) {
      throw new RestApiException('Issue not found');
    }

    return issue;
  }
}
