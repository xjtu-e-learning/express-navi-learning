import express = require('express');
import graphqlHTTP = require('express-graphql');
import { buildSchema } from 'graphql';
import expressJwt = require('express-jwt');
import cors = require('cors');
import bodyParser = require('body-parser');
import {Request, Response, NextFunction} from 'express';
import {getToken, signIn, signUp} from './controllers/login';
import {pool, secret} from '../secret';
import {getSubjects} from "./controllers/home";

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {hello: () => 'Hello world!'};

const loggingMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log('ip:', req.ip);
    console.log(req.get('referer'));
    next();
};

const server = express();
server.use(bodyParser.json());
server.use(cors());
server.use(expressJwt({
    secret: secret
}).unless({
    path: ['/getToken']
}));
server.use(loggingMiddleware);
server.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
server.use('/getToken', getToken);
server.use('/signUp', signUp);
server.use('/signIn', signIn);
server.use('/getSubjects', getSubjects);
server.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    if (err.name === 'UnauthorizedError') {
        res.status(200).send({
            code: 401,
            data: 'UnauthorizedError',
        });
    }
});
server.listen(4000);

process.on('SIGINT', async () => { (await pool).end(); console.log("1!"); process.exit(); });
process.on('exit', async () => { (await pool).end(); console.log("2!"); process.exit(); });
