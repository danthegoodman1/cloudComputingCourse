# Module 9: An Introduction to Cassand (and Scylla) <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [What is Cassandra?](#what-is-cassandra)
- [Cassandra vs. Scylla?](#cassandra-vs-scylla)
- [Cassandra Concepts](#cassandra-concepts)
- [Creating your first node](#creating-your-first-node)
    - [Installing Cassandra](#installing-cassandra)
    - [Configuring the Node for Internet Access](#configuring-the-node-for-internet-access)
    - [Test Cassandra](#test-cassandra)
    - [Node to Node Encryption](#node-to-node-encryption)
- [Getting Started in the DB](#getting-started-in-the-db)
    - [Create a Keyspace](#create-a-keyspace)
    - [Create a Table](#create-a-table)
    - [Setup the Client Library (NodeJS)](#setup-the-client-library-nodejs)
    - [Add Some Data](#add-some-data)
    - [Query Data](#query-data)
    - [Update Data](#update-data)
    - [Delete Data](#delete-data)

## What is Cassandra?

Cassandra has become one of the premiere databases across many platforms. It is a NoSQL database consisting of `tables` and `entries`, and is natively compatible with JSON structure (create/update/read). It is used by companies of all sizes, and is almost perfectly horizontally scalable (ex: 2 nodes has 2x performance of 2 node, 78 nodes have 78x performance of 1 node). Apple has over 78 nodes in their Cassandra cluster. Discord, Netflix, Twitter, and many others use massive Cassandra clusters to run their platforms. It has very high velocity read/write speeds, better language `CQL`, and has no single point of failure (no 'master' nodes). It is also a very cost effective database option, with no cloud provider lock-in.

## Cassandra vs. Scylla?

Scylla is basically Cassandra re-written in C++ (Cassandra is written in Java). Performance testing shows lower latencies, and higher throughput with the same resources as Cassandra, all using the same `CQL` language and configuration files as Cassandra. In fact they added a DynamoDB API interface as well (but you should still use CQL, it's faster).

For the most part they are setup and operate the same. Companies like Comcast and FireEye use ScyllaDB.

## Cassandra Concepts

You have 3 structures to think about in a Cassandra cluster:

1. **Node** - A Single VM or machine running Cassandra (you also have seed nodes, which we will get to later in clustering).
2. **Rack** - Cassandra is aware of racks, meaning it understands that in power failure events a whole rack can be taken out, but maybe not the whole data center. It uses this to shard data safely and efficiently.
3. **Data Center** - Physical locations where VMs or machines are located, Cassandra understands this to effectively and safely shard data (similar to racks).

## Creating your first node

#### Installing Cassandra

We'll be installing on Ubuntu 18.04 nodes.

*Check out [https://cassandra.apache.org/download/](https://cassandra.apache.org/download/) for the most updated instructions.*

Add Cassandra to apt repo:
`echo "deb https://downloads.apache.org/cassandra/debian 311x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list`

Add Cassandra repo keys:
`curl https://downloads.apache.org/cassandra/KEYS | sudo apt-key add -`

Update repos:
`sudo apt-get update`

Install Cassandra:
`sudo apt-get install cassandra`

**STOP HERE IF ADDING NEW NODES**

Enable and Start Cassandra:
`systemctl enable cassandra`
`systemctl start cassandra`

#### Configuring the Node for Internet Access

This should typically not be done, since your API should be the only thing interfacing with your DB cluster over a VPC or VPN, but for this tutorial we'll just expose it to the internet so we can write some sample code.

The configuration will just have different IPs for an internal network configuration.

First we need to edit the `/etc/cassandra/cassandra.yaml` file, open that in your favorite editor.

Find the following lines and set them in your config file (or create if they don't exist):

```
cluster_name: 'Something you choose'

start_rpc: true

rpc_address: 0.0.0.0

listen_address: x.x.x.x

broadcast_rpc_address: x.x.x.x

endpoint_snitch: "GossipingPropertyFileSnitch"

seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    - seeds: "x.x.x.x"

auto_bootstrap: false

num_tokens: 256
```

Where x.x.x.x is the interface you want to listen on.

*The rpc_address should be changed to x.x.x.x as well for an internal configuration.*

'rpc' addresses are for client communication, and other 'listening' addresses are for node-to-node communication.

Next, we need to edit the `/etc/cassandra/conf/cassandra-rackdc.properties` file to configure the data center and rack:

```
dc=DC1
rack=RACK1
```

We also need to allow certain ports on the firewall:

Allow client connection (API):
`ufw allow 9042`

Allow cluster node connections:
`ufw allow 7000`

#### Test Cassandra

To refresh the configuration, run:
`systemctl restart cassandra`

And check the node with:
`nodetool status`

#### Node to Node Encryption

See [https://www.linode.com/docs/databases/cassandra/set-up-a-cassandra-node-cluster-on-ubuntu-and-centos/#enable-node-to-node-encryption](https://www.linode.com/docs/databases/cassandra/set-up-a-cassandra-node-cluster-on-ubuntu-and-centos/#enable-node-to-node-encryption) for how to do this. If you are using a VPC properly everything should be encrypted natively across the network anyway (and nobody else can get on the network).

## Getting Started in the DB

While still SSH'd into the node, run:
`cqlsh`

This will drop us into the CQL shell.

#### Create a Keyspace
First, we need to create a keyspace. A keyspace is basically a virtual DB inside of the Cassandra cluster.

In CQL, run:
```
CREATE KEYSPACE exspace
WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3}
```

The replication factor just determines how many times data is replicated within the node. the IFT NOT EXISTS prevents us from getting an error if this keyspace already exists.

#### Create a Table
Next we need to create a table. A table is a collection of entities with a defined set of rows.

```
CREATE TABLE extable (
  namerow text PRIMARY KEY,
  descriptionrow text,
  numrow int
) WITH comment='this is a comment'
```

*NOTE: There are many ways ot set PRIMARY KEYs, see [https://cassandra.apache.org/doc/3.11.6/cql/ddl.html#create-table](https://cassandra.apache.org/doc/3.11.6/cql/ddl.html#create-table)*

#### Setup the Client Library (NodeJS)

For this example, we will use NodeJS as the client library. Create a project and run:

`npm i cassandra-driver`

Now we should create a `utils.js` file that will hold the configuration for us so we don't have to keep initializing it. Fill it in with:

```js
const cassandra = require('cassandra-driver')

const client = new cassandra.Client({
  contactPoints: ['x.x.x.x'],
  localDataCenter: 'DC1',
  keyspace: 'exspace'
})

exports.cassandra = cassandra
exports.client = client
```

#### Add Some Data

Now we need to add some data to our table. Let's create a `insert.js` file:

```js
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
```

The `?` in the query, and the array as the second argument of `client.execute()` is the library's way of doing injection. You should still manually sanitize inputs, but it's much less of a concern with CQL anyway since unless you do a `BATCH` operation, only a single command can be executed at a time.

Also, notice how I have `JSON` in the query? That is telling Cassandra that I want to operate in JSON form. Very handy.

Run this query a few times with some variation to get a few entries in your table.

#### Query Data

Now that we have data in the table, we can fetch it:

```js
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
}, err => { // This will run on an error, or when all rows are consumed
  if (!err) {
    console.log('All rows consumed.')
  }
})
```

Here I show 2 queries, and 2 ways to get data:

In `query`, I show you how to get all the data from the table.

In `query2`, I show how to get a select set of columns from a subset of data. You can do all sorts of filtering and comparisons in the command to get certain data. See [https://cassandra.apache.org/doc/3.11.6/cql/dml.html#select](https://cassandra.apache.org/doc/3.11.6/cql/dml.html#select) for examples of all of the operations you can do.

In `client.eachRow()`, I show you how to stream a query, rather than wait for the whole big object at once. If you know you are going to get many entries, it's best to handle the results this way so your resource usage doesn't spike as hard (or can even handle it).

#### Update Data

We can also update the data in `update.js`:

```js
const { client } = require('./utils')

const query = `UPDATE extable
SET descriptionrow = ?
WHERE namerow = ?`

client.execute(query, ['updated desc', 'example name'])
  .then((result) => {
    console.log(result)
    console.log('Updated.')
  })
  .catch((error) => {
    console.error(error)
  })
```

Go ahead and run your query again and see the changes.

#### Delete Data

Finally, we can delete it in `delete.js`:

```js
const { client } = require('./utils')

const query = 'DELETE FROM extable WHERE namerow = ?'

client.execute(query, ['example name'])
  .then((result) => {
    console.log(result)
    console.log('Deleted.')
  })
  .catch((error) => {
    console.error(error)
  })
```

**Check the next module for how to start clustering Cassandra**
