const { client } = require('./utils')

// const query = 'SELECT name, email FROM users WHERE key = ?'
const query = `CREATE KEYSPACE exspace
WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};`

client.execute(query)
  .then((result) => {
    console.log(result)
    console.log('Created.')
  })
  .catch((error) => {
    console.error(error)
  })
