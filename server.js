const app = require('koa')();
const router = require('koa-router')();
const koaBody = require('koa-body')();


const api = require('./services/api');

router.get('/', function* () {
  this.body = 'OpenTok Service';
});

router.post('/session', koaBody, api.getSession);

router.post('/token', koaBody, api.getToken);

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(function* (next) {
    this.app = this.request.host;
    yield next;
  });

app.listen(3000);
