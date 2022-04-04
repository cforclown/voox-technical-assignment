'use strict';

import { Environment } from '../common';
import express, { Express } from 'express';
import logger from 'morgan';
import expressFlash from 'express-flash';
import expressSession from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { container } from '../di-config';
import { InitLocalStrategy } from '../resources';
import path from 'path';
import { MainRouter } from './routers';

function App (): Express {
  const app = express();
  app.use(logger('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(
    cors({
      origin: Environment.getAppHost(),
      credentials: true
    })
  );
  app.use(expressFlash());
  app.use(
    expressSession({
      secret: Environment.getSessionSecret(),
      resave: Environment.getSessionResave(),
      saveUninitialized: Environment.getSessionSaveUninitialized(),
      cookie: {
        secure: Environment.getSessionCookieSecure(),
        maxAge: Environment.getSessionCookieMaxAge()
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  const authService = container.resolve('authService');
  InitLocalStrategy(passport, authService);

  app.use('/', MainRouter());

  return app;
}

export default App;
