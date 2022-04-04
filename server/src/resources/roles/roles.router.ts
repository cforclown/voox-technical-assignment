import { Router } from 'express';
import { checkAuthorization, RequestHandler, validateBody, validateParams } from '../../utils';
import { CreateRolePayloadSchema, FindRolesSchema, RoleIdSchema, UpdateRoleSchema } from './roles.dto';
import { RolesController } from './roles.controller';
import { ResourceTypes } from './roles.types';

export function RolesRouter ({ rolesController }: { rolesController: RolesController }): Router {
  const router = Router();

  router.get('/:roleId', validateParams(RoleIdSchema), RequestHandler(rolesController.get));
  router.post('/find', validateBody(FindRolesSchema), RequestHandler(rolesController.find));
  router.post('/', checkAuthorization(ResourceTypes.masterData, 'create'), validateBody(CreateRolePayloadSchema), RequestHandler(rolesController.create));
  router.put('/', checkAuthorization(ResourceTypes.masterData, 'update'), validateBody(UpdateRoleSchema), RequestHandler(rolesController.update));
  router.delete('/:roleId', checkAuthorization(ResourceTypes.masterData, 'delete'), validateParams(RoleIdSchema), RequestHandler(rolesController.delete));

  router.get('/role/default', RequestHandler(rolesController.getDefault));
  router.put('/role/default', checkAuthorization(ResourceTypes.masterData, 'update'), validateBody(RoleIdSchema), RequestHandler(rolesController.setDefault));

  return router;
}
