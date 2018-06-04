const views = require('koa-views');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const server = require('koa-static');
const path = require('path');

const Koa = require('koa');
const app = module.exports = new Koa();

const router = require('./routes/router')

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

app.use(koaBody());

app.use(server(path.join(__dirname, '/static')));

app.use(router.routes());

app.listen(3001);
