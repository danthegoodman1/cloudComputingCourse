const { client } = require('./utils')

const query = 'INSERT INTO extable JSON ?'

client.execute(query, [JSON.stringify({
  namerow: 'example name',
  descriptionrow: 'example desc',
  numrow: 3
})])
  .then((result) => {
    console.log(result)
    console.log('Created.')
  })
  .catch((error) => {
    console.error(error)
  })
