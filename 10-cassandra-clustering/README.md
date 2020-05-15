# Module 10: Clustering Cassandra <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [More on Clustering](#more-on-clustering)
- [Create the Cluster](#create-the-cluster)
- [Configure the new Node](#configure-the-new-node)
- [Run the new Node (and Reconfigure)](#run-the-new-node-and-reconfigure)
- [Missing DB Features?](#missing-db-features)

## More on Clustering
Like said previously, clustering is linear and horizontally scalable with no single point of failure.

You have 3 structures to think about in a Cassandra cluster:

1. **Node** - A Single VM or machine running Cassandra (you also have seed nodes, which we will get to later in clustering).
2. **Rack** - Cassandra is aware of racks, meaning it understands that in power failure events a whole rack can be taken out, but maybe not the whole data center. It uses this to shard data safely and efficiently.
3. **Data Center** - Physical locations where VMs or machines are located, Cassandra understands this to effectively and safely shard data (similar to racks).

It's also best to create multiple nodes at the same time in a new data center. You'll see why later. The nice thing is you only need ~3 seed nodes per data center, and you don't need to update the seed nodes on all machines. Also, only seed nodes in one data center need to have seed nodes from another. Meaning that if the node is not a seed node, it only needs to have seed nodes that are in the same data center (meaning you don't have to go update all nodes, but you do have to update all seed nodes).

From datastax:

*In multiple data-center clusters, include at least one node from each datacenter (replication group) in the seed list. Designating more than a single seed node per datacenter is recommended for fault tolerance. Otherwise, gossip has to communicate with another datacenter when bootstrapping a node.*
*Making every node a seed node is not recommended because of increased maintenance and reduced gossip performance. Gossip optimization is not critical, but it is recommended to use a small seed list (approximately three nodes per datacenter).*

## Create the Cluster

To create the cluster, we just have to create a new node similar to before:

Add Cassandra to apt repo:
`echo "deb https://downloads.apache.org/cassandra/debian 311x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list`

Add Cassandra repo keys:
`curl https://downloads.apache.org/cassandra/KEYS | sudo apt-key add -`

Update repos:
`sudo apt-get update`

Install Cassandra:
`sudo apt-get install cassandra`

**DO NOT START THE CLUSTER**

If the cluster did start, stop it with:
`systemctl stop cassandra`

And delete the data it may have created:

`rm -rf /var/lib/cassandra/data/system/*`

## Configure the new Node

For the sake of this tutorial, we will assume this is in a new data center on a new rack.

First, open the `/etc/cassandra/conf/cassandra-rackdc.properties` file and set to the following:

```
dc=DC2
rack=RACK1
```

*Note: Racks are specific to a data center, so racks in different data centers can share names without collisions*

Now open `/etc/cassandra/cassandra.yaml` and set the following:

```
cluster_name: '[Your Cluster Name]'
listen_address: [public_ip_address]
rpc_address: [public_ip_address]
num_tokens: 256
seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    - seeds: [original_node_ip]
endpoint_snitch: GossipingPropertyFileSnitch
auto_bootstrap: true
allocate_tokens_for_local_replication_factor: 3
```
There are a few things to note here:

First, we have `auto_bootstrap` set to `true`. We will need to set this to false later, but this tells it to fetch the info and data from the seed nodes.

Next, we didn't set this machine as a seed node *yet*. Seed nodes are basically nodes that other nodes look to get their initial data from when the first start. You should only have a few nodes per data center set as a seed node, and never set the machine as a seed node on start.

Now we also have the `allocate_tokens_for_local_replication_factor`. This is based on the most intensive keyspaces in our cluster. If it is the first node we are adding, multiple nodes in a data center or rack we should stagger down this value. ex: The first node we add would be `3`, then if our next most intensive keyspace was only `2`, the second node value would be `2`. This isn't required but it will increase performance of the cluster since it tells the cluster how to balance the keyspaces within the local cluster.

## Run the new Node (and Reconfigure)

Go ahead and run:
`systemctl enable cassandra`
`systemctl start cassandra`

Then:
`nodetool status`
to verify that the node has bootstrapped to the rest of the cluster.

Now we need to reconfigure the node since this is the first one in the data center, open `/etc/cassandra/cassandra.yaml` again:

```
seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    - seeds: [original_node_ip], [new_ip]
auto_bootstrap: false
```

We need to tell it not to keep bootstrapping, and we need to update the seed node list.

We also need to update this seed node list on the other seed node machines in the cluster. You can see why it's nice to setup many of them at the same time (so you don't have to keep going in and changing nodes).

Go change their `/etc/cassandra/cassandra.yaml` files and `systemctl restart cassandra` everything.

Now, we can change our `utils.js` file to look like this:

```
const cassandra = require('cassandra-driver')

const client = new cassandra.Client({
  contactPoints: ['x.x.x.x', 'y.y.y.y'],
  localDataCenter: 'DC1',
  keyspace: 'exspace'
})

exports.cassandra = cassandra
exports.client = client
```

where `y.y.y.y` is the new IP of the node we just added.

## Missing DB Features?

You might be thinking, after Firestore and MongoDB that we are missing features like full-text search indexing, event listeners, etc. Well these can be added in with other technologies (like is done at massive scale). Services like Algolia, or self hosted Apache Solr with [The authentication plugin](https://lucene.apache.org/solr/guide/8_3/rule-based-authorization-plugin.html) can handle your full-text search indexing. Simple websocket/pubsub can handle event listeners/emission, or you can use a service like Cloud pubsub, Pusher, etc. At scale, a single solution is dangerous since failure can take down everything, rather than a single feature.

See [https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/operations/opsAddNodeToCluster.html](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/operations/opsAddNodeToCluster.html) for more on adding and creating clusters.

And [https://www.linode.com/docs/databases/cassandra/deploy-scalable-cassandra/#enable-security-features](https://www.linode.com/docs/databases/cassandra/deploy-scalable-cassandra/#enable-security-features) for more on clustering and authentication.
