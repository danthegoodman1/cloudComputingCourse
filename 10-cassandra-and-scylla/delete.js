const { client } = require('./utils')

const query = 'DELETE FROM extable WHERE nametime = ?'

client.execute(query, ['another name'])
  .then((result) => {
    console.log(result)
    console.log('Deleted.')
  })
  .catch((error) => {
    console.error(error)
  })
