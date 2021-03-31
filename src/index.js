const executar = async () => {
  const conn = await require("./service/oracleCloud").getConnection()

  let quantidade = 0

  do {
    console.time("tempo")

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
        dtm_from_date BETWEEN TO_DATE ('01/01/2000 00:00:00', 'dd/mm/yyyy hh24:mi:ss')
        AND TO_DATE ('31/03/2020 00:00:00', 'dd/mm/yyyy hh24:mi:ss') and
        ROWNUM <= 1000
    order by
        dtm_from_date
  `)

    quantidade = rows.length

    console.log(`Registros encontrados: ${rows.length}`)
    // console.log(rows[0].INT_CALLLOG_KEY)

    // await conn.execute(`
    //     delete from
    //         tbl_pbx_calllog
    //     where
    //         int_calllog_key = ${rows[0].INT_CALLLOG_KEY}
    // `)

    // await conn.execute(`commit`)
    // console.log(`Commitando`)

    if (quantidade > 0) {
      rows = rows.map((row) => row.INT_CALLLOG_KEY)
      rows = rows.reduce((texto, item, index) => {
        if (index === rows.length - 1) {
          return (texto += `${item}`)
        }
        return (texto += `${item}, `)
      }, "")

      try {
        await conn.execute(`
            delete from
                tbl_pbx_calllog
            where
                int_calllog_key in (${rows})
        `)
      } catch (error) {
        console.log(error)
      }

      console.log(`Deletados`)

      await conn.execute(`commit`)

      console.log(`Commitando`)
    }

    console.timeEnd("tempo")
  } while (quantidade > 0)

  conn.close()
}

executar()
