const { client } = require('./utils')

const query = `CREATE TABLE extable (
  namerow text PRIMARY KEY,
  descriptionrow text,
  numrow int
) WITH comment='this is a comment'`

client.execute(query)
  .then((result) => {
    console.log(result)
    console.log('Created.')
  })
  .catch((error) => {
    console.error(error)
  })
