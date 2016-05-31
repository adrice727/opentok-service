/** Imports */
const app = require('koa')();
const router = require('koa-router')();
const koaBody = require('koa-body')();


/** Routes */
const api = require('./services/api');
const auth = require('./services/auth');
router.post('/token', api.getToken);
router.post('/session', api.getSession);
router.post('/credentials', api.getCredentials);
router.post('/whitelist', auth.isAdmin, auth.registerDomain);

router.get('*', function* () {
  this.body = 'OpenTok Service: مرحبا';
});

/** Middleware */
app
  .use(router.allowedMethods())
  .use(koaBody)
  .use(auth.validDomain)
  .use(router.routes());

/** Listen */
app.listen(process.env.PORT || 3000);
