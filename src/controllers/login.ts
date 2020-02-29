import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import NodeRSA from 'node-rsa';
import {createHash} from 'crypto';

import {pool, secret} from "../../secret";

export const getToken = (req: Request, res: Response) => {
    const key = new NodeRSA({b: 512});
    const token = 'Bearer ' + jwt.sign(
        {
            privateKey: key.exportKey('private'),
        },
        secret,
        {
            expiresIn: 3600 * 24 * 3,
        }
    );
    res.json({
        code: 200,
        data: {
            token: token,
            publicKey: key.exportKey('public'),
        },

    })
};

export const signUp = async (req: Request, res: Response) => {
    try {
        const key = new NodeRSA();
        key.importKey(req.user.privateKey, 'private');
        const data = key.decrypt(req.body.data, 'utf8');
        const { username, passwd } = JSON.parse(data);
        const result = await (await pool).query(`select * from users where username='${username}'`);
        if (result.length) {
            res.send({
                code: 500,
                data: 'user exist',
            });
            return;
        }
        const hash = createHash('sha256');
        hash.update(JSON.stringify({
            username,
            passwd,
        }));
        const userId = hash.digest('hex');
        const r = await (await pool).query(`INSERT INTO users (username, passwd, create_time, user_id) VALUES ('${username}', '${passwd}',  NOW(), '${userId}')`);
        res.send({
            code: 200,
            data: '',
        });
    } catch (e) {
        console.log(e.code);
        res.send({
            code: 500,
            data: 'server error',
        });
    }
};

export const signIn = async (req: Request, res: Response) => {
    try {
        const key = new NodeRSA();
        key.importKey(req.user.privateKey, 'private');
        const data = key.decrypt(req.body.data, 'utf8');
        const { username, passwd } = JSON.parse(data);
        const result = await (await pool).query(`select * from users where username='${username}' and passwd='${passwd}'`);
        console.log(result.length, result);
        if (!result.length) {
            res.send({
                code: 500,
                data: 'info error',
            });
            return;
        }
        const { user_id, username: name, id} = JSON.parse(JSON.stringify(result[0]));
        const token = 'Bearer ' + jwt.sign(
            {
                userId: user_id,
                userName: name,
                id: id,
            },
            secret,
            {
                expiresIn: 3600 * 24 * 3,
            }
        );
        res.send({
            code: 200,
            data: {
                token
            },
        });
    } catch (e) {
        res.send({
            code: 500,
            data: 'server error',
        })
    }
};
