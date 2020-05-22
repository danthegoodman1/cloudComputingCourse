# Indexing for Real time search <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Why?](#why)
- [Logic with Other Services](#logic-with-other-services)

## Why?
Maybe you need to make a custom log manager. Maybe you need to have historical search of messages real time. Maybe you want a search box that brings up results as you are typing. There are many reasons you may want full-text indexing for you application.

https://www.npmjs.com/package/elasticlunr and Algolia

https://nodejs.org/api/readline.html
https://nodejs.org/api/readline.html#readline_example_tiny_cli

## Logic with Other Services

While this custom solution and Algolia have websocket querying built-in, rarely is this feature included. As a result, we have to build these for ourselves.

When we work with Solr and Elasticsearch in the future, we won't want to give users direct access to the service. Rather, we would have an API (and VPC) in between, that can socket to the user. Then on every socket event, can make a query request to the cluster, and send the result back to the client through the websocket.
