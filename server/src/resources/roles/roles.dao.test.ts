import { RestApiException } from '../../exceptions';
import { RolesDao } from './roles.dao';
import { CreateRolePayload, FindRolesPayload, Role } from './roles.types';
import { MockMongooseModel } from '../../../__mock__';

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation(() => (MockMongooseModel))
}));

describe('roles-dao', () => {
  const mockRole1: Role = {
    _id: 'id-1',
    name: 'name-1',
    permissions: {
      users: {
        view: true,
        create: false,
        update: false,
        delete: false
      },
      masterData: {
        view: true,
        create: false,
        update: false,
        delete: false
      }
    },
    desc: 'desc'
  };
  const mockRole2: Role = {
    _id: 'id-2',
    name: 'name-2',
    permissions: {
      users: {
        view: true,
        create: false,
        update: false,
        delete: false
      },
      masterData: {
        view: true,
        create: false,
        update: false,
        delete: false
      }
    },
    desc: 'desc'
  };
  const findRolesPayload: FindRolesPayload = {
    query: '',
    pagination: {
      page: 1,
      limit: 10,
      sort: {
        by: 'name',
        order: 1
      }
    }
  };
  const createRolePayload: CreateRolePayload = {
    name: 'name',
    permissions: {
      users: {
        view: true,
        create: false,
        update: false,
        delete: false
      },
      masterData: {
        view: true,
        create: false,
        update: false,
        delete: false
      }
    },
    desc: 'desc'
  };

  const rolesDao = new RolesDao();

  MockMongooseModel.mockModelSelect.mockImplementation(() => ({
    exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
  }));
  MockMongooseModel.mockModelCreate.mockReturnValue(Promise.resolve(mockRole1));
  MockMongooseModel.mockModelPopulate.mockReturnValue(Promise.resolve());

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelFindById.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockRole1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully get role', async () => {
      const role = await rolesDao.get(mockRole1._id);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(role).toEqual(mockRole1);
    });

    it('should throw an error when role not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(rolesDao.get(mockRole1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.findById throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(rolesDao.get(mockRole1._id)).rejects.toThrow(RestApiException);
    });
  });

  describe('find', () => {
    const expectedRoles = {
      ...findRolesPayload,
      pagination: {
        ...findRolesPayload.pagination,
        pageCount: 1
      },
      data: [mockRole1, mockRole2]
    };

    beforeEach(() => {
      MockMongooseModel.mockModelAggregate.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve([{
        metadata: [{
          total: 2
        }],
        data: [mockRole1, mockRole2]
      }]));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully find roles', async () => {
      const roles = await rolesDao.find(findRolesPayload);
      expect(MockMongooseModel.mockModelAggregate).toHaveBeenCalled();
      expect(roles).toEqual(expectedRoles);
    });

    it('should successfully find roles (0)', async () => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve([{
        metadata: [],
        data: []
      }]));
      const roles = await rolesDao.find(findRolesPayload);
      expect(MockMongooseModel.mockModelAggregate).toHaveBeenCalled();
      expect(roles).toEqual({
        ...findRolesPayload,
        pagination: {
          ...findRolesPayload.pagination,
          pageCount: 0
        },
        data: []
      });
    });

    it('should throw an error when model.aggregate throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(rolesDao.find(findRolesPayload)).rejects.toThrow(RestApiException);
    });
  });

  describe('create', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create an role', async () => {
      const role = await rolesDao.create(createRolePayload);
      expect(MockMongooseModel.mockModelCreate).toHaveBeenCalled();
      expect(role).toEqual(mockRole1);
    });

    it('should throw an error when document.save throw an error', async () => {
      MockMongooseModel.mockModelCreate.mockRejectedValueOnce(new Error());
      await expect(rolesDao.create(createRolePayload)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      MockMongooseModel.mockFindByIdAndUpdate.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockRole1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully update role', async () => {
      const role = await rolesDao.update(mockRole1);
      expect(MockMongooseModel.mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(role).toEqual(mockRole1);
    });

    it('should throw an error when role not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(rolesDao.update(mockRole1)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when document.updateOne() throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(rolesDao.update(mockRole1)).rejects.toThrowError();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelDeleteOne.mockImplementation(() => ({
        exec: (): void => MockMongooseModel.mockModelExec()
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve({
        deletedCount: 1
      }));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete role', async () => {
      const deletedRoleId = await rolesDao.delete(mockRole1._id);
      expect(MockMongooseModel.mockModelDeleteOne).toHaveBeenCalled();
      expect(deletedRoleId).toEqual(mockRole1._id);
    });

    it('should throw api error when deletedCount is 0', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve({
        deletedCount: 0
      }));
      await expect(rolesDao.delete(mockRole1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.deleteOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(rolesDao.delete(mockRole1._id)).rejects.toThrowError();
    });
  });

  describe('getDefault', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelFindOne.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockRole1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully get role', async () => {
      const role = await rolesDao.getDefault();
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(role).toEqual(mockRole1);
    });

    it('should throw an error when role not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(rolesDao.getDefault()).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.findOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(rolesDao.getDefault()).rejects.toThrowError();
    });
  });

  describe('setDefault', () => {
    const mockUpdateManyExec = jest.fn();
    async function executeSetDefaultRole (roleId: string): Promise<Role> {
      const response = await rolesDao.setDefault(roleId) as any;
      response.save = undefined;
      return response;
    }

    beforeEach(() => {
      MockMongooseModel.mockModelFindById.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve({
        ...mockRole1,
        save: (): void => MockMongooseModel.mockModelSave(Promise.resolve())
      }));
      MockMongooseModel.mockModelUpdateMany.mockImplementation(() => ({
        exec: (payload: any): void => mockUpdateManyExec(payload)
      }));
      mockUpdateManyExec.mockReturnValue(Promise.resolve());
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully set default role', async () => {
      const defaultRole = await executeSetDefaultRole(mockRole1._id);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(mockUpdateManyExec).toHaveBeenCalled();
      expect(defaultRole).toEqual({
        ...mockRole1,
        default: true
      });
    });

    it('should throw api exception when role not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(executeSetDefaultRole(mockRole1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.updateMany throw an error', async () => {
      mockUpdateManyExec.mockRejectedValueOnce(new Error());
      await expect(executeSetDefaultRole(mockRole1._id)).rejects.toThrowError();
    });

    it('should throw an error when document.save throw an error', async () => {
      MockMongooseModel.mockModelSave.mockRejectedValueOnce(new Error());
      await expect(executeSetDefaultRole(mockRole1._id)).rejects.toThrowError();
    });
  });
});
