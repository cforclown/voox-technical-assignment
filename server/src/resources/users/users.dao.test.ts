import { CreateUserPayload, FindUsersPayload, User, UsersDao } from '.';
import { RestApiException } from '../../exceptions';
import { MockMongooseModel } from '../../../__mock__';
import { ChangeAvatarPayload, UpdateUserPayload } from './users.types';

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation(() => (MockMongooseModel))
}));

describe('users-dao', () => {
  const mockUser1: User = {
    _id: 'id-1',
    username: 'username-1',
    fullname: 'fullname-1',
    role: 'role'
  };
  const mockUser2: User = {
    _id: 'id-2',
    username: 'username-2',
    fullname: 'fullname-2',
    role: 'role'
  };
  const mockFindUsersPayload: FindUsersPayload = {
    query: '',
    pagination: {
      page: 1,
      limit: 10,
      sort: {
        by: 'fullname',
        order: 1
      }
    }
  };
  const mockCreateUserPayload: CreateUserPayload & { password: string } = {
    username: 'username',
    fullname: 'fullname',
    email: 'email',
    password: 'password',
    role: 'role'
  };
  const mockCreateUserPayloadWithoutEmail: CreateUserPayload & { password: string } = {
    username: 'username',
    fullname: 'fullname',
    password: 'password',
    role: 'role'
  };
  const mockUpdateUserPayload: UpdateUserPayload = {
    _id: mockUser1._id,
    username: 'username',
    fullname: 'fullname',
    email: 'email'
  };

  MockMongooseModel.mockModelCreate.mockReturnValue(Promise.resolve(mockUser1));
  MockMongooseModel.mockModelPopulate.mockReturnValue(Promise.resolve());

  const usersDao = new UsersDao();

  MockMongooseModel.mockModelSelect.mockImplementation(() => ({
    exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    MockMongooseModel.mockModelFindOne.mockImplementation(() => ({
      select: (payload: any): void => MockMongooseModel.mockModelSelect(payload)
    }));

    beforeEach(() => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockUser1));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully authenticate user', async () => {
      const user = await usersDao.authenticate({ username: 'username', password: 'password' });
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(user).toEqual(mockUser1);
    });

    it('should throw an error when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(usersDao.authenticate({ username: 'username', password: 'password' })).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.findOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(usersDao.authenticate({ username: 'username', password: 'password' })).rejects.toThrow(RestApiException);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelFindById.mockImplementation(() => ({
        populate: (payload: any): void => MockMongooseModel.mockModelPopulate(payload)
      }));
      MockMongooseModel.mockModelPopulate.mockImplementation(() => ({
        select: (payload: any): void => MockMongooseModel.mockModelSelect(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockUser1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully get user', async () => {
      const user = await usersDao.get(mockUser1._id);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(user).toEqual(mockUser1);
    });

    it('should throw an error when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(usersDao.get(mockUser1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.findById throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(usersDao.get(mockUser1._id)).rejects.toThrow(RestApiException);
    });
  });

  describe('find', () => {
    const expectedUsers = {
      ...mockFindUsersPayload,
      pagination: {
        ...mockFindUsersPayload.pagination,
        pageCount: 1
      },
      data: [mockUser1, mockUser2]
    };
    MockMongooseModel.mockModelAggregate.mockImplementation(() => ({
      exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
    }));

    beforeEach(() => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve([{
        metadata: [{
          total: 2
        }],
        data: [mockUser1, mockUser2]
      }]));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully find users', async () => {
      const users = await usersDao.find(mockFindUsersPayload);
      expect(MockMongooseModel.mockModelAggregate).toHaveBeenCalled();
      expect(users).toEqual(expectedUsers);
    });

    it('should successfully find users (0)', async () => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve([{
        metadata: [],
        data: []
      }]));
      const users = await usersDao.find(mockFindUsersPayload);
      expect(MockMongooseModel.mockModelAggregate).toHaveBeenCalled();
      expect(users).toEqual({
        ...mockFindUsersPayload,
        pagination: {
          ...mockFindUsersPayload.pagination,
          pageCount: 0
        },
        data: []
      });
    });

    it('should throw an error when model.aggregate throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(usersDao.find(mockFindUsersPayload)).rejects.toThrow(RestApiException);
    });
  });

  describe('isUsernameAvailable', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelFindOne.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return false when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      const isAvailable = await usersDao.isUsernameAvailable('username');
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(isAvailable).toEqual(true);
    });

    it('should successfully return true when user found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockUser1));
      const isAvailable = await usersDao.isUsernameAvailable('username');
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(isAvailable).toEqual(false);
    });

    it('should successfully return username availability (true) when exclude param is set', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      const isAvailable = await usersDao.isUsernameAvailable('username', mockUser1._id);
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(isAvailable).toEqual(true);
    });

    it('should throw an error when model.findOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(usersDao.isUsernameAvailable('username')).rejects.toThrow(RestApiException);
    });
  });

  describe('isEmailAvailable', () => {
    beforeEach(() => {
      MockMongooseModel.mockModelFindOne.mockImplementation(() => ({
        exec: (payload: any): void => MockMongooseModel.mockModelExec(payload)
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return false when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      const isAvailable = await usersDao.isEmailAvailable('email@email.com');
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(isAvailable).toEqual(true);
    });

    it('should successfully return true when user found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockUser1));
      const isAvailable = await usersDao.isEmailAvailable('email@email.com');
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(isAvailable).toEqual(false);
    });

    it('should successfully return username availability (true) when exclude param is set', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      const isAvailable = await usersDao.isEmailAvailable('email@email.com', mockUser1._id);
      expect(MockMongooseModel.mockModelFindOne).toHaveBeenCalled();
      expect(isAvailable).toEqual(true);
    });

    it('should throw an error when model.findOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(usersDao.isEmailAvailable('username')).rejects.toThrowError();
    });
  });

  describe('create', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create an user', async () => {
      const user = await usersDao.create(mockCreateUserPayload);
      expect(MockMongooseModel.mockModelCreate).toHaveBeenCalled();
      expect(MockMongooseModel.mockModelPopulate).toHaveBeenCalled();
      expect(user).toEqual(mockUser1);
    });

    it('should successfully create an user without email', async () => {
      const user = await usersDao.create(mockCreateUserPayloadWithoutEmail);
      expect(MockMongooseModel.mockModelCreate).toHaveBeenCalled();
      expect(MockMongooseModel.mockModelPopulate).toHaveBeenCalled();
      expect(user).toEqual(mockUser1);
    });

    it('should throw an error', async () => {
      MockMongooseModel.mockModelCreate.mockRejectedValueOnce(new RestApiException('error'));
      await expect(usersDao.create(mockCreateUserPayload)).rejects.toThrow(RestApiException);
    });
  });

  describe('update', () => {
    async function executeUpdateUser (payload: UpdateUserPayload): Promise<User> {
      const response = await usersDao.update(payload) as any;
      response.save = undefined;
      return response;
    }

    beforeEach(() => {
      MockMongooseModel.mockModelFindById.mockImplementation(() => ({
        select: (payload: any): void => MockMongooseModel.mockModelSelect(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve({
        ...mockUser1,
        save: (): void => MockMongooseModel.mockModelSave(Promise.resolve())
      }));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully update user', async () => {
      const user = await executeUpdateUser(mockUpdateUserPayload);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(MockMongooseModel.mockModelSave).toHaveBeenCalled();
      expect(user).toEqual({
        ...mockUser1,
        ...mockUpdateUserPayload
      });
    });

    it('should successfully update only users username', async () => {
      const user = await executeUpdateUser({
        _id: mockUser1._id,
        username: 'new-username'
      });
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(MockMongooseModel.mockModelSave).toHaveBeenCalled();
      expect(user).toEqual({
        ...mockUser1,
        username: 'new-username'
      });
    });

    it('should throw an error when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(executeUpdateUser(mockUpdateUserPayload)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when document.save() throw an error', async () => {
      MockMongooseModel.mockModelSave.mockRejectedValueOnce(new Error());
      await expect(executeUpdateUser(mockUpdateUserPayload)).rejects.toThrowError();
    });
  });

  describe('getUserAvatar', () => {
    MockMongooseModel.mockModelFindById.mockImplementation(() => ({
      select: (payload: any): void => MockMongooseModel.mockModelSelect(payload)
    }));

    beforeEach(() => {
      mockUser1.avatar = {
        data: 'data',
        filename: 'filename'
      };
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve(mockUser1));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully get user avatar', async () => {
      const avatar = await usersDao.getUserAvatar(mockUser1._id);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(avatar).toEqual(mockUser1.avatar);
    });

    it('should throw an error when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(usersDao.getUserAvatar(mockUser1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.findById throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new RestApiException('not found'));
      await expect(usersDao.getUserAvatar(mockUser1._id)).rejects.toThrow(RestApiException);
    });
  });

  describe('changeAvatar', () => {
    const userId = mockUser1._id;
    const avatar = {
      data: 'data',
      filename: 'filename'
    };
    async function executeChangeAvatar (userId: string, payload: ChangeAvatarPayload): Promise<User> {
      const response = await usersDao.changeUserAvatar(userId, payload) as any;
      response.save = undefined;
      return response;
    }

    beforeEach(() => {
      MockMongooseModel.mockModelFindById.mockImplementation(() => ({
        select: (payload: any): void => MockMongooseModel.mockModelSelect(payload)
      }));
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve({
        ...mockUser1,
        avatar,
        save: (): void => MockMongooseModel.mockModelSave(Promise.resolve())
      }));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully change user avatar', async () => {
      const user = await executeChangeAvatar(userId, avatar);
      expect(MockMongooseModel.mockModelFindById).toHaveBeenCalled();
      expect(MockMongooseModel.mockModelSave).toHaveBeenCalled();
      expect(user).toEqual({
        ...mockUser1,
        avatar
      });
    });

    it('should throw an error when user not found', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve(null));
      await expect(executeChangeAvatar(userId, avatar)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when document.save() throw an error', async () => {
      MockMongooseModel.mockModelSave.mockRejectedValueOnce(new Error());
      await expect(executeChangeAvatar(userId, avatar)).rejects.toThrowError();
    });
  });

  describe('delete', () => {
    MockMongooseModel.mockModelDeleteOne.mockImplementation(() => ({
      exec: (): void => MockMongooseModel.mockModelExec()
    }));

    beforeEach(() => {
      MockMongooseModel.mockModelExec.mockReturnValue(Promise.resolve({
        deletedCount: 1
      }));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete user', async () => {
      const deletedUserId = await usersDao.delete(mockUser1._id);
      expect(MockMongooseModel.mockModelDeleteOne).toHaveBeenCalled();
      expect(deletedUserId).toEqual(mockUser1._id);
    });

    it('should throw api error when deletedCount is 0', async () => {
      MockMongooseModel.mockModelExec.mockReturnValueOnce(Promise.resolve({
        deletedCount: 0
      }));
      await expect(usersDao.delete(mockUser1._id)).rejects.toThrow(RestApiException);
    });

    it('should throw an error when model.deleteOne throw an error', async () => {
      MockMongooseModel.mockModelExec.mockRejectedValueOnce(new Error());
      await expect(usersDao.get(mockUser1._id)).rejects.toThrowError();
    });
  });
});
