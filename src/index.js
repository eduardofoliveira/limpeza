const { subYears, format } = require("date-fns")

const agora = new Date()
const data = subYears(agora, 1)

const executar = async () => {
  const conn = await require("./service/oracleCloud").getConnection()

  for (let a = 0; a < 1000; a++) {
    let { rows } = await conn.execute(`
      select
          int_calllog_key
      from
          tbl_pbx_calllog
      where
          int_calllog_key not in (
              select
                  rf.int_calllog_key
              from
                  tbl_sys_recordfile rf,
                  tbl_pbx_calllog cl
              where
                  rf.int_calllog_key = cl.int_calllog_key
          ) and
          int_calllog_key not in (
              select
                  gf.int_calllog_key
              from
                  tbl_sys_groupfile gf,
                  tbl_pbx_calllog cl
              where
                  gf.int_calllog_key = cl.int_calllog_key
          ) and
          int_calllog_key not in (
              select
                  uf.int_calllog_key
              from
                  tbl_sys_userfile uf,
                  tbl_pbx_calllog cl
              where
                  uf.int_calllog_key = cl.int_calllog_key
          ) and
          dtm_from_date BETWEEN TO_DATE ('01/01/2000 00:00:00', 'dd/mm/yyyy hh24:mi:ss')
          AND TO_DATE ('${format(data, "dd/MM/yyyy HH:mm:ss")}', 'dd/mm/yyyy hh24:mi:ss') and
          rownum <= 1000
      order by
          dtm_from_date
  `)

    console.log(rows.length)
    rows = rows.map((row) => row.INT_CALLLOG_KEY)

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i]

      try {
        await conn.execute(`
          delete from
              tbl_pbx_calllog
          where
              int_calllog_key = ${item}
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
  }

  conn.close()
}

executar()
