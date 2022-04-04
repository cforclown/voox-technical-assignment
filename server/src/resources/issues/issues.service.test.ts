import { CreateIssuePayload, FindIssuesPayload, Issue } from './issues.types';
import { IssuesDao } from './issues.dao';
import { RestApiException } from '../../exceptions';
import { SortOrder } from '../../types';
import { IssuesService } from './issues.service';

const mockIssuesDaoGet = jest.fn();
const mockIssuesDaoFind = jest.fn();
const mockIssuesDaoCreate = jest.fn();
const mockIssuesDaoUpdate = jest.fn();
const mockIssuesDaoGetDefault = jest.fn();
const mockIssuesDaoSetDefault = jest.fn();
const mockIssuesDaoDelete = jest.fn();

jest.mock('./issues.dao', () => ({
  IssuesDao: jest.fn().mockImplementation(() => ({
    get: (payload: any): void => mockIssuesDaoGet(payload),
    find: (payload: any): void => mockIssuesDaoFind(payload),
    create: (payload: any): void => mockIssuesDaoCreate(payload),
    update: (payload: any): void => mockIssuesDaoUpdate(payload),
    getDefault: (payload: any): void => mockIssuesDaoGetDefault(payload),
    setDefault: (payload: any): void => mockIssuesDaoSetDefault(payload),
    delete: (payload: any): void => mockIssuesDaoDelete(payload)
  }))
}));

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation(() => ({}))
}));

describe('issues-service', () => {
  const mockIssue1: Issue = {
    _id: 'id-1',
    title: 'name-1',
    priority: 'high',
    label: ['electrical']
  };
  const mockIssue2: Issue = {
    _id: 'id-2',
    title: 'name-2',
    priority: 'high',
    label: ['electrical']
  };
  const mockFindIssuesPayload: FindIssuesPayload = {
    query: '',
    pagination: {
      page: 1,
      limit: 10,
      sort: {
        by: 'title',
        order: SortOrder.ASC
      }
    }
  };
  const mockCreateIssuePayload: CreateIssuePayload = {
    title: 'title',
    priority: 'low',
    label: ['plumbing']
  };

  mockIssuesDaoGet.mockReturnValue(Promise.resolve(mockIssue1));
  mockIssuesDaoFind.mockReturnValue(Promise.resolve({
    ...mockFindIssuesPayload,
    pagination: {
      ...mockFindIssuesPayload.pagination,
      pageCount: 1
    },
    data: [mockIssue1, mockIssue2]
  }));
  mockIssuesDaoCreate.mockReturnValue(Promise.resolve(mockIssue1));
  mockIssuesDaoUpdate.mockReturnValue(Promise.resolve(mockIssue1));
  mockIssuesDaoGetDefault.mockReturnValue(Promise.resolve(mockIssue1));
  mockIssuesDaoSetDefault.mockReturnValue(Promise.resolve(mockIssue1));
  mockIssuesDaoDelete.mockReturnValue(Promise.resolve(mockIssue1._id));

  const issuesService = new IssuesService({ issuesDao: new IssuesDao() });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should successfully return issue', async () => {
      const issue = await issuesService.get(mockIssue1._id);
      expect(mockIssuesDaoGet).toHaveBeenCalled();
      expect(issue).toEqual(mockIssue1);
    });

    it('should throw an error when issue not found', async () => {
      mockIssuesDaoGet.mockRejectedValueOnce(new RestApiException('not found'));

      await expect(issuesService.get(mockIssue1._id)).rejects.toThrow(RestApiException);
    });
  });

  describe('find', () => {
    it('should successfully find issues', async () => {
      const response = await issuesService.find(mockFindIssuesPayload);
      expect(mockIssuesDaoFind).toHaveBeenCalled();
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual([mockIssue1, mockIssue2]);
    });

    it('should return empty issues', async () => {
      mockIssuesDaoFind.mockReturnValue(Promise.resolve({
        ...mockFindIssuesPayload,
        pagination: {
          ...mockFindIssuesPayload.pagination,
          pageCount: 1
        },
        data: []
      }));

      const response = await issuesService.find(mockFindIssuesPayload);
      expect(mockIssuesDaoFind).toHaveBeenCalled();
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual([]);
    });

    it('should throw an error when data access object throw an error', async () => {
      mockIssuesDaoFind.mockRejectedValueOnce(new RestApiException('internal server error', 500));

      await expect(issuesService.find(mockFindIssuesPayload)).rejects.toThrow(RestApiException);
    });
  });

  describe('create', () => {
    it('should successfully create a issue with email', async () => {
      const response = await issuesService.create(mockCreateIssuePayload);
      expect(mockIssuesDaoCreate).toHaveBeenCalled();
      expect(response).toEqual(mockIssue1);
    });

    it('should throw api exception when issuesDao.create throw api exception', async () => {
      mockIssuesDaoCreate.mockRejectedValueOnce(new RestApiException('internal'));

      await expect(issuesService.create(mockCreateIssuePayload)).rejects.toThrow(RestApiException);
    });
  });

  describe('update', () => {
    it('should successfully update a issue', async () => {
      mockIssuesDaoUpdate.mockReturnValueOnce(Promise.resolve(mockIssue1));
      const response = await issuesService.update(mockIssue1);
      expect(mockIssuesDaoUpdate).toHaveBeenCalled();
      expect(response).toEqual(mockIssue1);
    });

    it('should throw an error when issuesDao throw an error', async () => {
      mockIssuesDaoUpdate.mockRejectedValueOnce(new RestApiException('internal'));
      await expect(issuesService.update(mockIssue1)).rejects.toThrow(RestApiException);
    });
  });

  describe('delete', () => {
    it('should successfully delete a issue', async () => {
      mockIssuesDaoDelete.mockReturnValueOnce(Promise.resolve('issueId'));
      const response = await issuesService.delete('issueId');
      expect(mockIssuesDaoDelete).toHaveBeenCalled();
      expect(response).toEqual('issueId');
    });

    it('should throw an error when data access object throw an error', async () => {
      mockIssuesDaoDelete.mockRejectedValueOnce(new RestApiException('internal server error', 500));
      await expect(issuesService.delete('issueId')).rejects.toThrow(RestApiException);
    });
  });
});
