# Lesson 2: Advanced Virtual Machines <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Basic Clustering](#basic-clustering)

## Basic Clustering

This is something we will explore under more serverless-style cloud computing lessons, but to keep it simple, clustering is important. What happens if you VM goes down? Your service goes down. This can't happen. _The show must go on!_ In order to reduce the chance that your entire service goes down, we use clustering. Clustering is essentially a bunch of machines, called `workers` or `nodes` or `slaves` that are hidden behind a `load balancer`. The client connecting to the cluster then hit the dedicated IP or domain of the load balancer, which determines which worker to send the connection to. Then the worker sends the response back to the load balancer, which returns it to you. Let's look at a diagram:

![Clustering Diagram](/assets/Untitled%20Diagram%20(1).png)

In this diagram, you can see what was described above. Clients connect to the load balancer, which handles the communication with the cluster.
