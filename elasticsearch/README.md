# Elasticsearch <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Why Elasticsearch](#why-elasticsearch)
- [Designing The Cluster](#designing-the-cluster)
    - [Node Types](#node-types)
    - [Load Balancing the Cluster](#load-balancing-the-cluster)
    - [Security](#security)
- [Installing Elasticsearch](#installing-elasticsearch)
    - [Configuration](#configuration)
- [Use the Cluster:](#use-the-cluster)

## Why Elasticsearch
Solr is awesome for smaller projects, and a single node with a local cluster can handle significant traffic. However, Elasticsearch has become an industry standard, especially for statistical data, and clusters very nicely. It's also built on top of Lucene. It does lack some of the text query features of Solr, but makes up in scalability.

## Designing The Cluster

Right out of the gate, we are going to be making a multi-node cluster, so create 3 Ubuntu VMs while you read the rest of this (referred to as VM1, VM2, and VM3 throughout this demo).

#### Node Types

ES (elasticsearch) has 2 major types of nodes in a cluster: A `data` node and a `master` node. A single node can take both of these roles as well. A `data` node is one that handles all of the indexing and CRUD operations in the cluster, while a `master` node handles orchestration, organization of data, and balancing. For smaller clusters, it's fine to have all nodes be both data and master by default (~3 nodes). On larger nodes, you definitely want to have dedicated master and data nodes to handle the traffic.

#### Load Balancing the Cluster

One really awesome feature of ES clusters is how it handles traffic. You can make the same queries to any node, whether it be a dedicated master, data, or both, and it will handle your request. This means load balancing becomes really easy, we just drop a load balancer in front of the cluster, and point it to all of the different nodes in the cluster.

#### Security

For the purposes of this tutorial, we will be exposing to the internet so you can access the cluster easily. However this should exist on a VPC that protects direct access from the outside world, and should only be interfaces with through an API that talks to the load balancer.

## Installing Elasticsearch

While you can install the whole ELK stack (Elasticsearch, Kibana, Logstash) on each VM, we are only going to install ES in this tutorial. There are many online for how to add in Kibana and Logstash to the mix for log handling and data visualizations.

On each VM, run the following:

```
apt update
apt install openjdk-8-jdk -y
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo sh -c 'echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list'
apt update
apt install elasticsearch -y
```

Now that we have it installed, we can start it with:

```
systemctl enable elasticsearch.service
systemctl start elasticsearch.service
```

And run:
`curl -X GET "localhost:9200/"`
to make sure it's alive.

#### Configuration

Stop ES with:
`systemctl stop elasticsearch.service`

Open the config file `/etc/elasticsearch/elasticsearch.yml`

There are a few things we want to consider on each node:

We need to configure the interface on which ES listens on:
```
network.host: node_ip
# Or to get localhost access as well:
# eth0 denotes the interface we want to listen on, _local_ says we also want to listen on localhost so we can run commands locally in ssh
network.host: [_eth0_, _local_]
```

We also need to set the cluster name:
```
cluster.name: ex-cluster
```

We also need to set the node name. This should be different on each node:
```
node.name: node-1
# And node-2, node-3 respectively
```

We need to set the clustering master node configuration:
```
cluster.initial_master_nodes: ["node-1"]
```

And we also need to tell each node where the others are:
```
discovery.seed_hosts: ["ip1", "ip2", "ip3"]
```

## Use the Cluster:

Run on each node:
`systemctl start elasticsearch.service`

After we let everything settle for a bit, we can check that the cluster is talking to each other:

```
curl -XGET 'http://localhost:9200/_cluster/state?pretty' | more
```

And look at the top for the `nodes` object to see all of the nodes. Make sure they are all there with the correct names.
