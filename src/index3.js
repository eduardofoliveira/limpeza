const { subYears, format } = require("date-fns")

const agora = new Date()
const data = subYears(agora, 1)

const executar = async () => {
  const conn = await require("./service/oracleCloud").getConnection()

  let { rows } = await conn.execute(`
    select
        *
    from
        tbl_callcenter_callevent
    where
        dtm_start < TO_DATE ('${format(data, "dd/MM/yyyy HH:mm:ss")}', 'dd/mm/yyyy hh24:mi:ss')
    order by
        int_calllog_key,
        int_eventtype
    `)

  let calllog_key = null
  let quantidade = rows.length

  for (let i = 0; i < rows.length; i++) {
    console.log(`${i + 1} de ${quantidade}`)

    const item = rows[i]

    await conn.execute(`
        delete from
            tbl_callcenter_callevent
        where
            int_callevent_key = ${item.INT_CALLEVENT_KEY}
        `)

    if (calllog_key === null) {
      calllog_key = item.CALLLOG_KEY
    } else if (calllog_key !== item.CALLLOG_KEY) {
      await conn.execute(`
        delete from
            tbl_callcenter_calllog
        where
            int_calllog_key = ${calllog_key}
        `)
      calllog_key = item.CALLLOG_KEY
    }
  }
  conn.close()
}

executar()
