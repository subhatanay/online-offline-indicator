const Pool = require('pg').Pool
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_DBNAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

module.exports=pool