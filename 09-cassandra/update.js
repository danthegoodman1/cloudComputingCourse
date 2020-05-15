const { client } = require('./utils')

const query = `UPDATE extable
SET description = ?
WHERE nametime = ?`

client.execute(query, ['updated desc', 'example name'])
  .then((result) => {
    console.log(result)
    console.log('Updated.')
  })
  .catch((error) => {
    console.error(error)
  })
