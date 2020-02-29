export const secret = 'secret';

const mysql = require('promise-mysql');

export const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'test',
    connectionLimit : 10,
});
