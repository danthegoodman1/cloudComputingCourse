const cassandra = require('cassandra-driver')

const client = new cassandra.Client({
  contactPoints: ['x.x.x.x'],
  localDataCenter: 'DC1',
  keyspace: 'exspace'
})

exports.cassandra = cassandra
exports.client = client
