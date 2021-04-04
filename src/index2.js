const { subYears, format } = require("date-fns")

const agora = new Date()
const data = subYears(agora, 1)

const executar = async () => {
  const conn = await require("./service/oracleCloud").getConnection()

  let { rows } = await conn.execute(`
        select
            int_systemcalllog_key
        from
            tbl_pbx_systemcalllog
        where
            dtm_starttime < TO_DATE ('${format(data, "dd/MM/yyyy HH:mm:ss")}', 'dd/mm/yyyy hh24:mi:ss')
    `)

  console.log(rows.length)
  rows = rows.map((row) => row.INT_SYSTEMCALLLOG_KEY)

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i]

    try {
      await conn.execute(`
            delete from
                tbl_pbx_systemcalllog
            where
                int_systemcalllog_key = ${item}
          `)
      console.log(`Deletados`)
      await conn.execute(`commit`)
      console.log(`Commitando`)
      console.log(`${i + 1} de ${rows.length}`)
    } catch (error) {
      console.log(error)
    }
  }
  console.log(`Total: ${a + 1} de 1000`)

  conn.close()
}

executar()
