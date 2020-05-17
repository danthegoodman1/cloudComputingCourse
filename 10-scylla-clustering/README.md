# Module 10: Clustering Scylla <!-- omit in toc -->

**Note:** This tutorial does not cover setting up authentication to the DB. We assume this is on some VPC that already has protection layers setup, and the DB is interfaced indirectly through an API. In a production setup, clustering keys and basic user/passwords should be setup to secure the nodes and cluster.

For Speed of learning authentication is ignored so we can rapidly setup the node and cluster.

## Table of Contents <!-- omit in toc -->
- [More on Clustering](#more-on-clustering)
- [Create the Nodes](#create-the-nodes)
- [Configure the new Node](#configure-the-new-node)
- [Finish Setup and Run the new Node](#finish-setup-and-run-the-new-node)
- [Missing DB Features?](#missing-db-features)
- [Cassandra/Scylla Cluster Advantages](#cassandrascylla-cluster-advantages)
- [Cassandra/Scylla Cluster Disadvantages](#cassandrascylla-cluster-disadvantages)
- [Other Resources](#other-resources)

## More on Clustering
Like said previously, clustering is linear and horizontally scalable with no single point of failure.

You have 3 structures to think about in a Cassandra cluster:

1. **Node** - A Single VM or machine running Cassandra/Scylla (you also have seed nodes, which we will get to later in clustering).
2. **Rack** - Cassandra/Scylla is aware of racks, meaning it understands that in power failure events a whole rack can be taken out, but maybe not the whole data center. It uses this to shard data safely and efficiently.
3. **Data Center** - Physical locations where VMs or machines are located, Cassandra/Scylla understands this to effectively and safely shard data (similar to racks).

It's also best to create multiple nodes at the same time in a new data center. You'll see why later. The nice thing is you only need ~3 seed nodes per data center, and you don't need to update the seed nodes on all machines. Also, only seed nodes in one data center need to have seed nodes from another. Meaning that if the node is not a seed node, it only needs to have seed nodes that are in the same data center (meaning you don't have to go update all nodes, but you do have to update all seed nodes).

From datastax:

*In multiple data-center clusters, include at least one node from each datacenter (replication group) in the seed list. Designating more than a single seed node per datacenter is recommended for fault tolerance. Otherwise, gossip has to communicate with another datacenter when bootstrapping a node.*
*Making every node a seed node is not recommended because of increased maintenance and reduced gossip performance. Gossip optimization is not critical, but it is recommended to use a small seed list (approximately three nodes per datacenter).*

## Create the Nodes

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

## Configure the new Node

For this example, we are going to be setting up a multi-data center cluster. The idea of a 'rack' is less useful here since we don't know the location of the physical hardware.

Open `/etc/scylla/cassandra-rackdc.properties`:

```
dc=DATC2
rc=RACK1
prefer_local=true
```
Make the dc=`DATC1` and `DATC2`, `etc.` on each node you are making.

*Note: Racks are specific to a data center, so racks in different data centers can share names without collisions*

Now open `/etc/cassandra/cassandra.yaml` and set the following:

```
cluster_name: '[Your Cluster Name]'
listen_address: [public_ip_address]
rpc_address: [public_ip_address]
seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    - seeds: "[node1_ip], [node2_ip]"
endpoint_snitch: GossipingPropertyFileSnitch
```
There are a few things to note here:

## Finish Setup and Run the new Node

To finish setting up scylla, run:
`scylla_setup`
and follow the prompts to your configuration. They should mostly be no except for the dependencies one.

Then, configure the IO:
`scylla_io_setup`

Go ahead and run:
`systemctl start scylla-server`

Then:
`nodetool status`
to verify that the node has bootstrapped to the rest of the cluster.

Now, we can change our `utils.js` file to look like this:

```
const cassandra = require('cassandra-driver')

const client = new cassandra.Client({
  contactPoints: ['x.x.x.x', 'y.y.y.y'],
  localDataCenter: 'DATC1',
  keyspace: 'exspace'
})

exports.cassandra = cassandra
exports.client = client
```

where `y.y.y.y` is the new IP of the node we just added.

## Missing DB Features?

You might be thinking, after Firestore and MongoDB that we are missing features like full-text search indexing, event listeners, etc. Well these can be added in with other technologies (like is done at massive scale). Services like Algolia, or self hosted Apache Solr with [The authentication plugin](https://lucene.apache.org/solr/guide/8_3/rule-based-authorization-plugin.html) can handle your full-text search indexing. Simple websocket/pubsub can handle event listeners/emission, or you can use a service like Cloud pubsub, Pusher, etc. At scale, a single solution is dangerous since failure can take down everything, rather than a single feature.

## Cassandra/Scylla Cluster Advantages

**Super duper fast**. It's fast. Really Fast. Reads and writes happen with very low latency.

**Cheaper**. Depending on how you use it, and what your data looks like, it can be a whole lot cheaper than managed database services like Firestore, Firestore (in Datastore mode), DynamoDB, MongoDB, etc.

## Cassandra/Scylla Cluster Disadvantages

**Scaling after creating a cluster can be a pain**. You need to manually create all of these nodes, and configure seeds on all of the other nodes. You can see how at 50 or 100 nodes this can be a real pain.

**You have to manage it, probably** Setting up secure VPCs, making sure nodes are healthy, node authentication, and scaling. Unless you are paying someone else to do it, or paying another company to manage it, it can quickly become a pain. This is why people pay others so much money for their databases. Databases are central to functionality of your solution and it needs to be the most reliable and high performing piec.

## Other Resources

*Scylla*
See [https://docs.scylladb.com/operating-scylla/procedures/cluster-management/add_node_to_cluster/](https://docs.scylladb.com/operating-scylla/procedures/cluster-management/add_node_to_cluster/)

And [https://docs.scylladb.com/operating-scylla/procedures/cluster-management/create_cluster_multidc/](https://docs.scylladb.com/operating-scylla/procedures/cluster-management/create_cluster_multidc/)

*Cassandra*
See [https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/operations/opsAddNodeToCluster.html](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/operations/opsAddNodeToCluster.html) for more on adding and creating clusters.

And [https://www.linode.com/docs/databases/cassandra/deploy-scalable-cassandra/#enable-security-features](https://www.linode.com/docs/databases/cassandra/deploy-scalable-cassandra/#enable-security-features) for more on clustering and authentication.
