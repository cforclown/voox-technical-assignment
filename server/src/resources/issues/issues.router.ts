import { Router } from 'express';
import { checkAuthorization, RequestHandler, validateBody, validateParams } from '../../utils';
import { CreateIssuePayloadSchema, FindIssuesSchema, IssueIdSchema, UpdateIssueSchema } from './issues.dto';
import { IssuesController } from './issues.controller';
import { ResourceTypes } from '../roles';

export function IssuesRouter ({ issuesController }: { issuesController: IssuesController }): Router {
  const router = Router();

  router.get('/', RequestHandler(issuesController.getAll));
  router.get('/:issueId', validateParams(IssueIdSchema), RequestHandler(issuesController.get));
  router.post('/find', validateBody(FindIssuesSchema), RequestHandler(issuesController.find));
  router.post('/', checkAuthorization(ResourceTypes.masterData, 'create'), validateBody(CreateIssuePayloadSchema), RequestHandler(issuesController.create));
  router.put('/', checkAuthorization(ResourceTypes.masterData, 'update'), validateBody(UpdateIssueSchema), RequestHandler(issuesController.update));
  router.delete('/:issueId', checkAuthorization(ResourceTypes.masterData, 'delete'), validateParams(IssueIdSchema), RequestHandler(issuesController.delete));

  return router;
}
