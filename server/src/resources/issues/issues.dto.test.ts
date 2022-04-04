import { validateSchema } from '../../utils/validate-schema';
import { ValidationException } from '../../exceptions/validation-exception';
import { CreateIssuePayloadSchema, FindIssuesSchema, IssueSchema } from './issues.dto';
import { CreateIssuePayload, FindIssuesPayload, Issue } from './issues.types';

describe('issues-data-transfer-object', () => {
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
    title: 'name',
    priority: 'low',
    label: ['plumbing']
  };
  const mockIssue: Issue = {
    _id: 'id',
    title: 'title',
    priority: 'low',
    label: ['plumbing']
  };

  describe('FindIssuesSchema', () => {
    it('should return value when schema is valid', () => {
      const result = validateSchema({ schema: FindIssuesSchema, payload: mockFindIssuesPayload });
      expect(result).toEqual(mockFindIssuesPayload);
    });

    it('should throw validation exception when page not provided', () => {
      expect(() => validateSchema({
        schema: FindIssuesSchema,
        payload: {
          query: '',
          pagination: {
            limit: 10,
            sort: {
              by: 'name',
              order: 1
            }
          }
        }
      })).toThrow(ValidationException);
    });

    it('should throw validation exception when limit not provided', () => {
      expect(() => validateSchema({
        schema: FindIssuesSchema,
        payload: {
          query: '',
          pagination: {
            page: 1,
            sort: {
              by: 'name',
              order: 1
            }
          }
        }
      })).toThrow(ValidationException);
    });
  });

  describe('CreateIssuePayloadSchema', () => {
    it('should return validated values when payload is valid', () => {
      const result = validateSchema({ schema: CreateIssuePayloadSchema, payload: mockCreateIssuePayload });
      expect(result).toEqual(mockCreateIssuePayload);
    });

    it('should throw validation exception when name not provided', () => {
      expect(() => validateSchema({
        schema: CreateIssuePayloadSchema,
        payload: {
          ...mockCreateIssuePayload,
          name: undefined
        }
      })).toThrow(ValidationException);
    });
  });

  describe('IssueSchema', () => {
    it('should return value when schema is valid', () => {
      const result = validateSchema<CreateIssuePayload>({
        schema: IssueSchema,
        payload: mockIssue
      });
      expect(result).toEqual(mockIssue);
    });

    it('should throw validation exception when name not provided', () => {
      expect(() => validateSchema({
        schema: CreateIssuePayloadSchema,
        payload: {
          ...mockIssue,
          name: undefined
        }
      })).toThrow(ValidationException);
    });

    it('should throw validation exception when permissions not provided', () => {
      expect(() => validateSchema({
        schema: CreateIssuePayloadSchema,
        payload: {
          ...mockIssue,
          permissions: undefined
        }
      })).toThrow(ValidationException);
    });
  });
});
