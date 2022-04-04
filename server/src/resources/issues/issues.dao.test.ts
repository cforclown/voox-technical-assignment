import { RestApiException } from '../../exceptions';
import { IssuesDao } from './issues.dao';
import { CreateIssuePayload, FindIssuesPayload, Issue } from './issues.types';
import { MockMongooseModel } from '../../../__mock__';

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation(() => (MockMongooseModel))
}));

describe('issues-dao', () => {
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
        order: 1
      }
    }
  };
  const mockCreateIssuePayload: CreateIssuePayload = {
    title: 'title',
    priority: 'low',
    label: ['plumbing']
  };

  const issuesDao = new IssuesDao();

  MockMongooseModel.mockModelSelect.mockImplementation(() => ({
    exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
  }));
  MockMongooseModel.mockModelCreate.mockReturnValue(Promise.resolve(mockIssue1));
  MockMongooseModel.mockModelPopulate.mockReturnValue(Promise.resolve());

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelFindById.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockIssue1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully get issue', async () => {
      const issue = await issuesDao.get(mockIssue1._id);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(issue).toEqual(mockIssue1);
    });

    it('should throw an error when issue not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(issuesDao.get(mockIssue1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.findById throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(issuesDao.get(mockIssue1._id)).rejects.toThrow(RestApiException);
    });
  });

  describe('find', () => {
    const expectedIssues = {
      ...mockFindIssuesPayload,
      pagination: {
        ...mockFindIssuesPayload.pagination,
        pageCount: 1
      },
      data: [mockIssue1, mockIssue2]
    };

    beforeEach(() => {
      MockMongooseModel.mockModelAggregate.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve([{
        metadata: [{
          total: 2
        }],
        data: [mockIssue1, mockIssue2]
      }]));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully find issues', async () => {
      const issues = await issuesDao.find(mockFindIssuesPayload);
      expect(MockMongooseModel.mockModelAggregate).toHaveBeenCalled();
      expect(issues).toEqual(expectedIssues);
    });

    it('should successfully find issues (0)', async () => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve([{
        metadata: [],
        data: []
      }]));
      const issues = await issuesDao.find(mockFindIssuesPayload);
      expect(MockMongooseModel.mockModelAggregate).toHaveBeenCalled();
      expect(issues).toEqual({
        ...mockFindIssuesPayload,
        pagination: {
          ...mockFindIssuesPayload.pagination,
          pageCount: 0
        },
        data: []
      });
    });

    it('should throw an error when model.aggregate throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(issuesDao.find(mockFindIssuesPayload)).rejects.toThrow(RestApiException);
    });
  });

  describe('create', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create an issue', async () => {
      const issue = await issuesDao.create(mockCreateIssuePayload);
      expect(MockMongooseModel.mockModelCreate).toHaveBeenCalled();
      expect(issue).toEqual(mockIssue1);
    });

    it('should throw an error when document.save throw an error', async () => {
      MockMongooseModel.mockModelCreate.mockRejectedValueOnce(new Error());
      await expect(issuesDao.create(mockCreateIssuePayload)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      MockMongooseModel.mockFindByIdAndUpdate.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockIssue1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully update issue', async () => {
      const issue = await issuesDao.update(mockIssue1);
      expect(MockMongooseModel.mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(issue).toEqual(mockIssue1);
    });

    it('should throw an error when issue not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(issuesDao.update(mockIssue1)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when document.updateOne() throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(issuesDao.update(mockIssue1)).rejects.toThrowError();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      MockMongooseModel.mockFindByIdAndUpdate.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve({
        ...mockIssue1,
        archived: true
      }));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete issue', async () => {
      const deletedIssue = await issuesDao.delete(mockIssue1._id);
      expect(MockMongooseModel.mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(deletedIssue).toEqual({
        ...mockIssue1,
        archived: true
      });
    });

    it('should throw api error when issue not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(issuesDao.delete(mockIssue1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.deleteOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(issuesDao.delete(mockIssue1._id)).rejects.toThrowError();
    });
  });
});
