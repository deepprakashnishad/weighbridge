const mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 5,
  host: 'remotemysql.com',
  user: 'qpprF0nLD8',
  password: 'a5uhzM6Rcl',
  database: 'qpprF0nLD8'
});
