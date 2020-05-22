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
    - [Create an Index](#create-an-index)
    - [Insert Some Data](#insert-some-data)
    - [Query Your Data](#query-your-data)

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

The role of the node needs to be set. For the purpose of this cluster, all nodes will be master and data nodes. So you don't need to include these settings:
```
# true or false respectively for the node's role
node.master: true/false
node.data: true/false
```

We need to set the clustering master node configuration:
```
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

And we also need to tell each node where the others are:
```
discovery.seed_hosts: ["ip1", "ip2", "ip3"]
```

Another thing we need to consider is memory locking. Memory swaping will have a negative performance impact on the node if allowed

```
bootstrap.memory_lock: true
```

## Use the Cluster:

Run on each node:
`systemctl start elasticsearch.service`

After we let everything settle for a bit, we can check that the cluster is talking to each other:

```
curl -XGET 'http://localhost:9200/_cluster/state?pretty' | more
```

And look at the top for the `nodes` object to see all of the nodes. Make sure they are all there with the correct names.

#### Create an Index

Open something like postman, or you can use cURL, so we can create an index to put entries into. For the sake of copy-pasta, I'm going to show you using cURL (but you should be able to translate these to postman requests)

*See: [https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html) for all of the field types*

Make a `PUT` request to `http://[any_ip]:9200/testindex` with a body of:

```json
{
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 2
    },
    "mappings" : {
        "properties": {
            "field1": {
            	"type": "text"
        	},
            "field2": {
            	"type": "number"
            }
        }
    }
}
```

You should get a 200 response.

#### Insert Some Data

Now we want to insert some documents into the index, make some variations of the data in the following request:

`POST` request to the endpoint `http://[any_ip]:9200/testindex/_doc`

```json
{
	"field1": "This is field 1 text",
	"field2": 30
}
```

```json
{
	"field1": "This is some more text",
	"field2": 50
}
```

```json
{
	"field1": "This is another much longer block of text that can be easily indexed and queried by elasticsearch",
	"field2": 100
}
```

You should get a 201 response.

#### Query Your Data

Now we want to fetch this data.

Make a `GET` (can also be a `POST` request for body inclusive queries) request to `http://[any_ip]:9200/testindex/_search?q=field1:text`

Now we get this big response with our documents:

```json
{
	"took": 494,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 3,
			"relation": "eq"
		},
		"max_score": 0.16320503,
		"hits": [
			{
				"_index": "testindex",
				"_type": "_doc",
				"_id": "NIQHPXIB9CcrizfP4I1v",
				"_score": 0.16320503,
				"_source": {
					"field1": "This is field 1 text",
					"field2": 30
				}
			},
			{
				"_index": "testindex",
				"_type": "_doc",
				"_id": "NYQJPXIB9CcrizfPRo1T",
				"_score": 0.16320503,
				"_source": {
					"field1": "This is some more text",
					"field2": 50
				}
			},
			{
				"_index": "testindex",
				"_type": "_doc",
				"_id": "NoQJPXIB9CcrizfPVo3-",
				"_score": 0.097923025,
				"_source": {
					"field1": "This is another much longer block of text that can be easily indexed and queried by elasticsearch",
					"field2": 100
				}
			}
		]
	}
}
```

We can do a cross-field query like so:

`http://[any_ip]:9200/testindex/_search?q=more`

Which should return:
```json
{
	"took": 14,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 1,
			"relation": "eq"
		},
		"max_score": 1.1987913,
		"hits": [
			{
				"_index": "testindex",
				"_type": "_doc",
				"_id": "NYQJPXIB9CcrizfPRo1T",
				"_score": 1.1987913,
				"_source": {
					"field1": "This is some more text",
					"field2": 50
				}
			}
		]
	}
}
```

We can also do some filtering by making a `POST` request to `http://[any_ip]:9200/testindex/_search?q=` with a body of:

```json
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "field2": { "gte": 40 }}}
      ]
    }
  }
}
```

This will return our 2 documents with a `field2` value greater than `40`.

We can also add in our text query back with:

```json
{
  "query": {
    "bool": {
    	"must": [
        	{ "term": { "field1": "longer" } }
		],
      "filter": [
        { "range": { "field2": { "gte": 40 } } }
      ]
    }
  }
}
```

Will give us a single result, or if we want to search across all fields:

```json
{
  "query": {
    "bool": {
    "must": {
        "multi_match" : {
          "query": "text"
        }
      },
      "filter": [
        { "range": { "field2": { "gte": 40 } } }
      ]
    }
  }
}
```

This will give us our 2 results.

The `multi_match` object can specif only certain fields too:
```json
"multi_match" : {
  "query": "text",
  "fields": ["field1"]
}
```
But be careful, if the query type doesn't match the field type (like string against integer), then the query will fail. Excluding the `fields` fields will tell elasticsearch that we only want to use fields which have the same type.

*See: [https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html), and other ES 7.7+ docs for more on boolean queries and filtering.*
