const mysql = require('mysql2');

const pool = mysql.createPool ({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'test1234',
    database: 'sample1'
});

const promisePool = pool.promise();
module.exports = promisePool;