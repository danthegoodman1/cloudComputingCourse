# Module 14: MongoDB <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Why Mongo](#why-mongo)
- [Disadvantages](#disadvantages)

## Why Mongo

MongoDB is the closest Cloud Provider abstracted DB to Firestore and Datastore. It has an awesome, easy to use API, that is JS-like syntax in the command line. They also have their own hosting, *MongoDB Atlas* where they host the MongoDB cluster for you. They have a free tier of that, so we'll be using it for this module.

Mongo has many features like event listeners (just like listening for changes in Firestore), schemaless design, powerful querying, and full-text search indexing built in (in the case of mongodb atlas).

Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and get setup, no credit card required (a nice change).

## Disadvantages

Sounds near perfect, but it's not. Once you get into the cloud panel, look at the predicted read/write of the cluster. It doesn't get to match Firestore performance for writes until it starts getting a little expensive. It won't touch Datastore performance until you get around $30,000/month at time of writing, with massive NVMe clusters.

It's great at small to medium scale, but becomes 
