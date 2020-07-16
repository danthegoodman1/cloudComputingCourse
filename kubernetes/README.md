# Kubernetes with Google Kubernetes Engine <!-- omit in toc -->

*It wouldn't be a cloud class if we didn't do Kubernetes.*

## Table of Contents <!-- omit in toc -->
- [Requirements for this](#requirements-for-this)
- [Overview](#overview)
- [Why Kubernetes?](#why-kubernetes)
- [Getting Started](#getting-started)
- [DigitalOcean](#digitalocean)
  - [Create your Cluster](#create-your-cluster)
  - [Install and Configure `kubectl`](#install-and-configure-kubectl)

## Requirements for this

- Node.JS (and npm)
- Docker
- kubectl
- A DigitalOcean account
- a GCP account and project with billing enabled

## Overview

Buckle up, we're going to jump right in. Kubernetes can be confusing, hopefully I can clear it up.

Kubernetes, or k8s _(The abbreviation K8s is replacing the eight letters of “ubernete” with the digit 8. k3s exists as well which is a lighter weight k8s for use on IoT and ARM) I am going to call it k8s a lot through this._

Our objectives are simple:
- Create a cluster
- Run an express.js web server
- Create an HTTPS Load Balancer
- Autoscale the cluster for pods and nodes
- Do this on DO and GCP

## Why Kubernetes?

Before Kubernetes, serverless was a much trickier problem. Manually managing nodes and, and what was running on those nodes, sucked.

_Enter Kubernetes_

Kubernetes basically unlocked the full potential of Docker. Now we could take these highly portable workloads, and elastically scale them as deployments across entire cluster, with only 1 setup.

Once we made the cluster, we could easily configure what workloads runs on it and with what resources/access.

_Elasticity, Availability, and Security baked right in._

_At least better than running without K8s_

## Getting Started

We are going to start in DigitalOcean, then move our way into Google Cloud Platform. Both are totally acceptable for production environments at this point, DO has been killing it.

## DigitalOcean

### Create your Cluster

Go to DO, and make a new project. In that project create a cluster.

Make the cluster 3 of the cheapest nodes (`$10/month` each at time of writing). One node pool (this is default), and give both the pool and the cluster names something a littler easier to identify. So you can copy commands, name the pool: `pool-learning` and the cluster: `k8s-learning`.

Nodes will automatically be tagged with both these names.

Now we continue while we wait 800 years (like 4 minutes) for that cluster to create.

### Install and Configure `kubectl`

The cli utility for k8s it `kubectl`. _Install it._

Now we need to configure it for use with our DO k8s cluster. There are many ways to do this (in order of priority when running a command):

- Use the `--context=[filename]` flag in every command _(yikes)_
- Set the `KUBECONFIG` env. var
- Set the `~/.kube/config` file

We are going to set the `KUBECONFIG` env. var for DO. We'll see the third option take place when using GCP because the `gcloud` cli configures that all for us.

In the cluster creation page it will offer you to download the cluster config file. Download that and drop it in your new fancy `~/.kube` folder (or make it if it doesn't exist). Then in your terminal run:

```sh
cd ~/.kube
export KUBECONFIG=$(PWD)/[name_of_file]
```

Use this terminal window for the rest of the lesson, or re run that command if you close it/switch. That env. var only lives in this `tty`.
