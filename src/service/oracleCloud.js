const oracledb = require('oracledb')
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

const getConnection = () => {
  return new Promise((resolve, reject) => {
    oracledb
      .getConnection({
        user: 'basixbrastel',
        password: 'basix',
        connectString: 'basix.clr7weopqptw.us-east-2.rds.amazonaws.com:1521/BASIX',
      })
      .then((connection) => {
        resolve(connection)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const getPool = () => {
  return new Promise((resolve, reject) => {
    oracledb
      .createPool({
        user: 'basixbrastel',
        password: 'basix',
        connectString: 'basix.clr7weopqptw.us-east-2.rds.amazonaws.com:1521/BASIX',
        poolMax: 120,
        poolMin: 100,
        poolIncrement: 5,
        poolTimeout: 4,
      })
      .then((pool) => {
        resolve(pool)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports = {
  getConnection,
  getPool,
}
