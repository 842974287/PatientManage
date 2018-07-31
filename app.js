const views = require('koa-views');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const server = require('koa-static');
const session = require('koa-session');
const path = require('path');

const Koa = require('koa');
const app = module.exports = new Koa();

const router = require('./router')

app.keys = ['qweasd'];

// middleware

app.use(logger());

app.use(
    views(
        path.join(__dirname, '/views'), {
            extension: 'html',
            map: { html: 'swig' }
        }
    )
);

app.use(koaBody({ multipart: true }));

app.use(session(app));

app.use(server(path.join(__dirname, '/static')));

app.use(server(path.join(__dirname, '/photo')));

app.use(router.routes());

app.listen(3001);
console.log('listening on port 3001');
