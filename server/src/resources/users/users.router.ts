import { Request, Router } from 'express';
import { UsersController } from './users.controller';
import { ChangeAvatarPayloadSchema, ChangeUserRolePayloadSchema, CreateUserPayloadSchema, FindUsersSchema, UpdateProfilePayloadSchema, UserIdSchema, UsernameAvailabilitySchema } from './users.dto';
import { checkAuthorization, dro, RequestHandler, validateBody, validateParams } from '../../utils';
import { ResourceTypes } from '../roles';
import { SaveError } from '../../common';
import { HttpCodes, RestApiException } from '../../exceptions';

export function UsersRouter ({ usersController }:{usersController:UsersController}): Router {
  const router = Router();

  router.get('/:userId', validateParams(UserIdSchema), RequestHandler(usersController.get));
  router.post('/find', validateBody(FindUsersSchema), RequestHandler(usersController.find));
  router.get('/username/available/:username', validateParams(UsernameAvailabilitySchema), RequestHandler(usersController.isUsernameAvailable));
  router.post('/', checkAuthorization(ResourceTypes.users, 'create'), validateBody(CreateUserPayloadSchema), RequestHandler(usersController.create));
  router.put('/change-role', checkAuthorization(ResourceTypes.users, 'update'), validateBody(ChangeUserRolePayloadSchema), RequestHandler(usersController.changeRole));
  router.delete('/:userId', checkAuthorization(ResourceTypes.users, 'delete'), validateParams(UserIdSchema), RequestHandler(usersController.delete));
  router.get('/avatar/:userId', validateParams(UserIdSchema), async (req: Request, res) => {
    try {
      const data = await usersController.getAvatar(req);
      return res.send(data);
    } catch (err) {
      if (err instanceof RestApiException) {
        return res.status(err.httpCode).send(dro.error(err.message));
      }
      if (err instanceof Error) {
        SaveError(err);
        return res.status(HttpCodes.Internal).send(dro.error(err.message));
      }
    }
  });
  router.get('/profile/details', RequestHandler(usersController.getProfile));
  router.get('/profile/permissions', RequestHandler(usersController.getPermissions));
  router.put('/profile', validateBody(UpdateProfilePayloadSchema), RequestHandler(usersController.updateProfile));
  router.put('/profile/avatar', validateBody(ChangeAvatarPayloadSchema), RequestHandler(usersController.changeAvatar));

  return router;
}
