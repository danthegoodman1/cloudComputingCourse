# Project 2: A Self Hosted Secure Scalable Service <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Summary](#summary)
- [Requirements](#requirements)
- [Why Self Hosted Only?](#why-self-hosted-only)
- [Submission (in class)](#submission-in-class)
- [Stages](#stages)
- [Grading](#grading)
    - [Extra Credit:](#extra-credit)

This will be one of the largest, if not the largest project in this course. In class I am going to give you 5 weeks to do this project from announcing it.

## Summary

You are going to be building a web app, API, SaaS solution, what ever using the technologies we've learned so far. To make sure this project is done in timely manner, we will be doing it in phases every week. You can form teams of 3 or less (if there is an uneven number 4 is ok for one group).

This project is going to be entirely self hosted. That means everything is running on a VM or container. No Firestore, Datastore, Firebase Auth, Algolia, nothing. You can run on DigitalOcean, GCP, or even AWS (honestly any cloud provider). If you would like you could use their Kubernetes offerings, but it must run on either Kubernetes or raw VMs.

**No auto-scaling required**

## Requirements

**Your project must have:**

- **A VPC/VLAN/VPN** that protects the internal services (DB, Indexing, etc.) from being directly accessed, and your API can reach into. This can be the cloud provider's built in one
- **An HTTPS Load Balancer** for your API/Web App. This can also be the cloud provider's offering, but I'll give 10% extra credit if you use NGINX, HAProxy, or something else on a VM. *This should handle SSL termination*
- **A Clustered Database** implemented with some level of authentication between nodes, this can be Cassandra, Scylla, MongoDB, etc.
- **A Search Feature** Using Solr or an Elasticsearch cluster
- **An API** that powers your SaaS, or your Web Interface, or both

## Why Self Hosted Only?

It's important to say you've used these technologies in real applications, rather than just coded along with me. If you go to work in giant tech companies, the only cloud services that are fully managed that they might use are Kubernetes and Cloud Storage, chances are everything else is running on top of VMs/Containers due to how much managed DBs and Indexing costs at scale.

## Submission (in class)

You will have a `README.md` file that goes over the purpose, functionality, and architecture of your project.

There will be staged check-in's where you can upload your repo as a `.zip` to Canvas. You will also update your `README.md` file for each stage to include what you've done for that phase.

For the final submission, you will turn in the whole code base, and present your project, architecture, and design process to the class.

## Stages

You can always change anything past when its phase is due if you want to keep improving upon it.

**Phase 1: Create a Database Cluster and VPC**

**Phase 2: Create a Clustered API**
That you can use to make CRUD operations

**Phase 3: **

## Grading

Grading for this project will be very dynamic, do not worry. Also the grade is mostly determined by whether the infrastructure is setup and working, rather than if it's implemented into the project functionality. But, here are the weights that will determine the grade:

**Database Cluster Running and Working: 15%**

**Database Functionality in Project: 5%**

**Load Balanced API/Interface: 20%**

**Search Cluster Running and Working: 10%**

**Search Functionality in Project: 5%**

**VPC Protected DB and Search: 10%**

**README file and Presentation: 20%**

**Peer Review and Participation: 20%**

#### Extra Credit:
**Self Hosted Load Balancer: 10%**
