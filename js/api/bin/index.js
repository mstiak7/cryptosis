#!/usr/bin/env node
const Koa = require('koa');
const uhttp = require('http');
// const uhttp = require('uws').http; headers are empty in the request object when using this server
const Router= require('koa-router');
const passport = require('koa-passport');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const session = require('koa-generic-session');
const morgan = require('morgan');
const ctk = require('koa-connect');
const applyMiddlewares = require('../core/middlewares');
const setupRoutes = require('../core/routes');
const logger = require('../core/logger');
const db = require('../data/db');

if(process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

db.init()
  .bimap(
    error => logger.error(error),
    () => {
      logger.info('Succesfully conected to the db');

      const app = new Koa();
      app.proxy = true;
      app.keys = [process.env.SESSION_KEY];

      applyMiddlewares(app);

      const router = setupRoutes(Router());

      app
        .use(router.routes())
        .use(router.allowedMethods())
        .use(ctk(morgan('dev')))
        .use(bodyParser())
        .use(convert(session()))
        .use(passport.initialize())
        .use(passport.session())

      uhttp
        .createServer(app.callback())
        .listen(process.env.SERVER_PORT, () => {
          logger.info(`Koa server listening on port ${process.env.SERVER_PORT}`);
        });
    }
  )
  .run();
