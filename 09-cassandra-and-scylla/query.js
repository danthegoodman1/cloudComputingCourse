const { client } = require('./utils')

const query = 'SELECT JSON * FROM extable' // Get everything

const query2 = `SELECT JSON namerow, descriptionrow FROM extable WHERE namerow='example name'` // Get specific items from a subset

client.execute(query)
  .then((result) => {
    console.log(result)
    console.log('Query Complete.')
  })
  .catch((error) => {
    console.error(error)
  })

client.eachRow('SELECT JSON row, descriptionrow FROM extable', [], (n, row) => {
  console.log(`row ${n}:`)
  console.log(row)
}, err => {
  if (!err) {
    console.log('All rows consumed.')
  }
})
