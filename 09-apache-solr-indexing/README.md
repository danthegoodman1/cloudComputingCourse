# Module 09: Apache Solr <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Why Solr?](#why-solr)
- [Install](#install)
- [Basic Usage](#basic-usage)
    - [Schemas](#schemas)
    - [Add Data](#add-data)
    - [Query Data](#query-data)
    - [Dynamic Fields](#dynamic-fields)
    - [Search multiple fields](#search-multiple-fields)
    - [More Querying Resources](#more-querying-resources)

## Why Solr?

Apache Solr is built on top of Apache Lucene, their Java indexing and search engine that is regarded as the industry standard. It's can also be clustered.

*Note: Just like a database, full-text search indexing can be a fundamental part of your operation. Heavily consider having this managed by another company like Algolia if you don't have high volume. It is far less crucial than a database, since you can always fall back on the database for slower searches.*
*See: [https://www.algolia.com](https://www.algolia.com), you can see how expensive search can get at scale, but it is so nice to use.*

## Install

*See [https://lucene.apache.org/solr/guide/8_5/solr-tutorial.html](https://lucene.apache.org/solr/guide/8_5/solr-tutorial.html) for an updated guide.*

First, lets install Solr on a DO VM. Visit [https://lucene.apache.org/solr/downloads.html](https://lucene.apache.org/solr/downloads.html) and click the link for `Binary Release`, then copy the url for the suggested mirror (something like `https://mirrors.ocf.berkeley.edu/apache/lucene/solr/8.5.1/solr-8.5.1.zip`)

In your terminal, run:
`wget https://mirrors.ocf.berkeley.edu/apache/lucene/solr/8.5.1/solr-8.5.1.zip`

Then unzip/tar it (depending on what you chose):

Zip:
`unzip solr-8.5.1.zip`

Tar:
`tar -xvf solr-8.5.1.tgz`

Now get into the new bin folder:
`cd solr-8.5.1/bin`

We also need java:
`apt update && apt install default-jdk -y`

And we want to execute Solr:
`./solr start -e cloud -force`

This tells solr that we want setup in a cloud environment (baby local cluster) (you can use the `-noprompt` flag if you don't want to walk through the next steps). Let's pick 2 nodes, and leave everything default.

## Basic Usage

Now, visit `http://[droplet_ip]:8983/solr` in a browser.

On the left menu, go to `Collections` and click `Add Collection`. Give it a name, set `replicationFactor` and `numShards` to `1`, and create it.

Now in the first dropdown on the left menu, select the name of your collection. Then select `Schema` in the new menu.

#### Schemas

We need to define a schema for the objects in this collection, so that Solr knows how to query them. Click `Add Field`. Give it a name of `namefield`, a type of `string`, and click `Add Field`.

Create another field of name `numfield` and type `pfloat`.

#### Add Data

Open something like Postman for building web requests, and setup the following request:

Type: `POST`
URL: `http://[droplet_ip]:8983/solr/excol/update/json/docs?commitWithin=1000`
Body (`application/json`):
```json
[
  {
    "namefield": "name1",
    "numfield": 300
  }
]
```
*Note: You can do an array like this to add multiple documents*

You should get a 200 response back that looks something like:

```
{
  "responseHeader": {
    "rf": 1,
    "status": 0,
    "QTime": 15
  }
}
```

Make another one:
```json
[
  {
	  "namefield": "Example Name",
	  "numfield": 500
  }
]
```

Now we have these documents in Solr, let's query them.

#### Query Data

We need to make a `GET` request to `http://[droplet_ip]:8983/solr/excol/select`

This is nice to do in the `Query` panel in the side menu, as you can visually build the query, then see the url made for that exact query at the top of the screen. So let's do that.

Set the `q` field (query) to `namefield:name*`

and the `fq` field (filter query) to `numfield:[0 TO *]`

This will name a query where the `namefiled` begins with `name`, and the `numfield` is greater than or equal to `0` (use `{0 TO *}` to exclude ends of range).

Now pull off the `numfield` filter, and change the `q` to `namefield:*name*`. That will give you all of them.

If you don't have the wildcards for strings, it will look for exact matches. This is because we made it a `string` field. If you want something that can be searched without wild cards (like a description), use the `txt_en` field.

#### Dynamic Fields

Another great feature of Solr is `Dynamic Fields`. You can see them listed in the schema menu (ex: `*_txt_en`), or you can make then yourself.

`Dynamic Fields` allow you to create searchable fields on the fly, after you've made a schema. Let's try using it now.

Make a new document like this:

```json
{
	"namefield": "Big Name",
	"numfield": 999900,
	"example_txt_en": "this is some example text"
}
```
Then do a query with only `q` set to `example_txt_field:example`.

This will give you only that document which contains "example" in a field named `example_txt_field`.

Now we can do queries for parts of the text field by setting `q` to `example_text_en:"some text"` and we'll find our one result.

#### Search multiple fields

Sometimes we want to look in multiple fields, because we may not know if someone is searching a username, display name, description, etc.

Use a `q` of `*`, and an `fq` of `text_1:something OR text_2:something` to search in multiple fields. We can use many logical operators like `OR` and `AND` to filter queries (see resources below for more details).

#### More Querying Resources

See the following for documentation and more examples:

[https://lucene.apache.org/solr/guide/8_5/common-query-parameters.html](https://lucene.apache.org/solr/guide/8_5/common-query-parameters.html)

[https://lucene.apache.org/solr/guide/8_5/the-standard-query-parser.html](https://lucene.apache.org/solr/guide/8_5/the-standard-query-parser.html)

[http://www.solrtutorial.com/solr-query-syntax.html](http://www.solrtutorial.com/solr-query-syntax.html)
