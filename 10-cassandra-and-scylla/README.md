# Module 10: An Introduction to Cassandra (and Scylla) <!-- omit in toc -->

**Note:** This tutorial does not cover setting up authentication to the DB. We assume this is on some VPC that already has protection layers setup, and the DB is interfaced indirectly through an API. In a production setup, clustering keys and basic user/passwords should be setup to secure the nodes and cluster.

For Speed of learning authentication is ignored so we can rapidly setup the node and cluster.

*See [https://www.linode.com/docs/databases/cassandra/deploy-scalable-cassandra/#enable-security-features](https://www.linode.com/docs/databases/cassandra/deploy-scalable-cassandra/#enable-security-features) for more on clustering and authentication*

## Table of Contents <!-- omit in toc -->
- [What is Cassandra?](#what-is-cassandra)
- [Cassandra vs. Scylla?](#cassandra-vs-scylla)
- [Cassandra Concepts](#cassandra-concepts)
- [Creating your first node](#creating-your-first-node)
    - [Installing Scylla](#installing-scylla)
    - [Configuring the Node for Internet Access](#configuring-the-node-for-internet-access)
    - [Finish Setup](#finish-setup)
    - [Node to Node Encryption](#node-to-node-encryption)
- [Using the DB](#using-the-db)
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

You have 3 structures to think about in a Cassandra/Scylla cluster:

1. **Node** - A Single VM or machine running Cassandra/Scylla (you also have seed nodes, which we will get to later in clustering).
2. **Rack** - Cassandra/Scylla is aware of racks, meaning it understands that in power failure events a whole rack can be taken out, but maybe not the whole data center. It uses this to shard data safely and efficiently.
3. **Data Center** - Physical locations where VMs or machines are located, Cassandra/Scylla understands this to effectively and safely shard data (similar to racks).

## Creating your first node

#### Installing Scylla

We'll be installing on Ubuntu 18.04 nodes.

*Check out [https://www.scylladb.com/download/](https://www.scylladb.com/download/) for the most updated instructions.*

Add Scylla to apt repo:
`sudo curl -o /etc/apt/sources.list.d/scylla.list -L http://repositories.scylladb.com/scylla/repo/8fd0c4f7-ce41-408c-a5fe-1660fb504c6b/ubuntu/scylladb-4.0-bionic.list`

Add Cassandra repo keys:
`sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 5e08fbd8b5d6ec9c`

Update repos:
`sudo apt-get update`

Install Cassandra:
`sudo apt-get install scylla`

Set Java Release:
```
sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt-get update
sudo apt-get install -y openjdk-8-jre-headless
sudo update-java-alternatives -s java-1.8.0-openjdk-amd64
```

#### Configuring the Node for Internet Access

This should typically not be done, since your API should be the only thing interfacing with your DB cluster over a VPC or VPN, but for this tutorial we'll just expose it to the internet so we can write some sample code.

The configuration will just have different IPs for an internal network configuration.

First we need to edit the `/etc/cassandra/cassandra.yaml` file, open that in your favorite editor.

Find the following lines and set them in your config file (or create if they don't exist):

```
cluster_name: 'Something you choose'

rpc_address: x.x.x.x

listen_address: x.x.x.x

endpoint_snitch: GossipingPropertyFileSnitch

seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    - seeds: "x.x.x.x"
```
*Where x.x.x.x is the interface you want to listen on.*

Let's also setup some clustering info, open `/etc/scylla/cassandra-rackdc.properties`:

```
dc=DATC1
rc=RACK1
prefer_local=true
```
We'll use this config in the next module.

'rpc' addresses are for client communication, and other 'listening' addresses are for node-to-node communication.

We also need to allow certain ports on the firewall:
*see: [https://docs.scylladb.com/operating-scylla/admin/#networking](https://docs.scylladb.com/operating-scylla/admin/#networking)*

*These will already be open on DO Droplets*

Allow client connection (API):
`ufw allow 9042`

Allow rpc connections:
`ufw allow 9160`

Allow cluster node connections:
`ufw allow 7000`

#### Finish Setup

To finish setting up scylla, run:
`scylla_setup`
and follow the prompts to your configuration. They should mostly be no except for the dependencies one.

Then, configure the IO:
`scylla_io_setup`

This will give us a handy indication how well our nodes perform. The cluster performance will be about the sum of these nodes' performance.
*Although I've seen 2 of the exact same nodes with one having half the performance for some reason*

Now, we can start the node:
`systemctl start scylla-server`

And check the node with:
`nodetool status`

#### Node to Node Encryption

See [https://www.linode.com/docs/databases/cassandra/set-up-a-cassandra-node-cluster-on-ubuntu-and-centos/#enable-node-to-node-encryption](https://www.linode.com/docs/databases/cassandra/set-up-a-cassandra-node-cluster-on-ubuntu-and-centos/#enable-node-to-node-encryption) for how to do this. If you are using a VPC properly everything should be encrypted natively across the network anyway (and nobody else can get on the network).

## Using the DB

While still SSH'd into the node, run:
`cqlsh x.x.x.x`
*Where x.x.x.x is the address you used before*

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

*Note: There are many ways ot set PRIMARY KEYs, see [https://cassandra.apache.org/doc/3.11.6/cql/ddl.html#create-table](https://cassandra.apache.org/doc/3.11.6/cql/ddl.html#create-table)*

#### Setup the Client Library (NodeJS)

For this example, we will use NodeJS as the client library. Create a project and run:

`npm i cassandra-driver`

Now we should create a `utils.js` file that will hold the configuration for us so we don't have to keep initializing it. Fill it in with:

```js
const cassandra = require('cassandra-driver')

const client = new cassandra.Client({
  contactPoints: ['x.x.x.x'],
  localDataCenter: 'DC1',
  keyspace: 'exspace' // This can only be set once you've created your keyspace
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

**Check the next module for how to start clustering Scylla**