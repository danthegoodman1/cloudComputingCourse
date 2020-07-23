# Kubernetes with DigitalOcean and Google Kubernetes Engine <!-- omit in toc -->

*It wouldn't be a cloud class if we didn't do Kubernetes.*

## Table of Contents <!-- omit in toc -->
- [Requirements for this](#requirements-for-this)
- [Overview](#overview)
- [Why Kubernetes?](#why-kubernetes)
- [Getting Started](#getting-started)
- [DigitalOcean](#digitalocean)
  - [Create your Cluster](#create-your-cluster)
  - [Install and Configure `kubectl`](#install-and-configure-kubectl)
  - [Deployments](#deployments)
    - [Setup](#setup)
    - [Create the Container](#create-the-container)
    - [Create the Deployment](#create-the-deployment)
  - [Ingress and Load Balancing](#ingress-and-load-balancing)
    - [HTTPS Load Balancing](#https-load-balancing)
    - [Resources](#resources)
    - [Autoscaling](#autoscaling)
    - [Clean Up](#clean-up)
- [Google Kubernetes Engine](#google-kubernetes-engine)
  - [Create your Cluster](#create-your-cluster-1)
  - [Configure `kubectl` for your cluster](#configure-kubectl-for-your-cluster)
  - [Deploy to Cluster](#deploy-to-cluster)
  - [Ingress and Load Balancing](#ingress-and-load-balancing-1)
    - [Load Balancing](#load-balancing)
    - [HTTPS Load Balancing](#https-load-balancing-1)
    - [Autoscaling](#autoscaling-1)
  - [Cleaning Up](#cleaning-up)

## Requirements for this

- Node.JS (and npm)
- Docker
- `kubectl`
- `doctl`
- `gcloud` cli utility
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

Here is a good summary of why k8s is awesome:

1) **Open Source:** You can put your code anywhere k8s can run. It can be on any cloud provider. **You are never locked in to a certain cloud provider** holding your VM images or configurations. K8s is supported on all major cloud providers, and can by run on prem, or both!
2) **Scale and Elasticity:** K8s manages your infrastructure for you. It scales it up and down, kills bad nodes and pods and replaces them with new ones, and always works as hard as it can to make sure your app stays running.
3) **Modularity:** You can put any workload you want, and as many as you can fit on your cluster. Your cluster is no longer just a collection of VMs, but a pool of total compute power (number of CPUs, GBs of RAM). You can also support anything that could possibly run in a Docker container.
4) **DevOps:** Updates and version routing become easier. You can route certain requests to certain deployments, so you can host legacy versions of software and also do rolling updates to ensure everything is fine before you push everything to production.
5) **Industry Standard:** Because of the above 4 reasons, k8s has quickly become the industry standard for running modern apps in the cloud. Whether it be an API, a high traffic website, or service workers. K8s can handle it all.

## Getting Started

We are going to start in DigitalOcean, then move our way into Google Cloud Platform. Both are totally acceptable for production environments at this point, DO has been killing it.

## DigitalOcean

### Create your Cluster

Go to DO, and make a new project. In that project create a cluster.

Make the cluster 3 of the cheapest nodes (`$10/month` each at time of writing). One node pool (this is default), and give both the pool and the cluster names something a littler easier to identify. So you can copy commands, name the pool: `pool-learning` and the cluster: `k8s-learning`.

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

When it is ready, you should be able to run `kubectl get nodes` and see your running nodes:

```
NAME                  STATUS   ROLES    AGE     VERSION
pool-learning-3jqu7   Ready    <none>   2m52s   v1.18.3
pool-learning-3jquc   Ready    <none>   2m41s   v1.18.3
pool-learning-3jqum   Ready    <none>   2m41s   v1.18.3
```

### Deployments

In Kubernetes, a workload is based on a `deployment`. Deployments determine what resources are allocated to a workload, how many replicas of a pod there are, and what that pod is. Deployments are one of the levels of abstractions from simple VMs in a cluster.

We can create these deployments with `kubectl`, or more preferably, using `.yaml` files.

#### Setup

Let's create a `deployment.yaml` file now and fill it with some goodies.

Scratch that... lets make an app first.

Go ahead and create a simple express app like so:
_You should know how to install everything to get this running_

```js
const app = require('express')()
const cors = require('cors')
app.use(cors())

app.get('/', (req, res) => {
  console.log('I got: request on root')
  res.send('Hello from root!')
})

app.get('/test', (req, res) => {
  console.log('I got: request on /test')
  res.send('Hello from /test!')
})

app.listen(8080, () => {
  console.log('Listening on port 8080')
})
```

We also need to create a `Dockerfile`:

```docker
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . ./

CMD [ "npm", "start" ]
```

#### Create the Container

Now we need to make a container and host it on a DigialOcean private container registry.

In DO go to the `Images` tab on the left, `Container Registry`, and make one.

Then we need to tell out cluster that it is allowed to access our registry.

run `doctl registry login`

then `doctl registry kubernetes-manifest | kubectl apply -f -`

This creates a Kubernetes 'secret' that tells it how to fetch our containers later.

Finally, we tell the cluster to apply this secret to all of our `yaml` files:

`kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "registry-testime"}]}'`

Now we need to build out container:

run `docker build -t testcontainer .` where `testcontainer` is the name of our new container.

Now we can push it up to our container registry:
`docker tag testcontainer registry.digitalocean.com/testime/testcontainer`
`docker push registry.digitalocean.com/testime/testcontainer`

Where `testime` is the name of your registry.

#### Create the Deployment

Now we can attend to our `deployment.yaml` file.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: testcontainer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: testcontainer
  template:
    metadata:
      labels:
        app: testcontainer
    spec:
      containers:
      - name: testcontainer-deployment
        image: registry.digitalocean.com/testime/testcontainer
        ports:
        - containerPort: 8080
          protocol: TCP
```

Let's explain this a little:

We want to create a `Deployment` with the name `testcontainer`. We want `3` replicas of this container running by default, and we are setting the selector to `testcontainer` (this is how we reference the deployment in other services, as you will see).

The template for our deployment is based on our `testcontainer` container, and we are calling it `testcontainer-deployment`. We also want to open `TCP` port `8080`.

We can tell our cluster to apply this Deployment by running:
`kubectl apply -f deployment.yaml`

We can verify this by running:

`kubectl get deployments`

and we should see our deployment name, and after some time we should have `3/3` `READY`

### Ingress and Load Balancing

Now we want to be able to access our deployment with a LoadBalancer Service or Ingress. On DO, we can create a load balancer right away. Create a `lb.yaml` file:

```yaml
kind: Service
apiVersion: v1
metadata:
  name: testcontainer
spec:
  type: LoadBalancer
  selector:
    app: testcontainer
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 8080
```

This service will create a load balancer that redirects any port `80` to `testcontainer`'s port `8080`.

Apply with `kubectl apply -f lb.yaml`

Then run `kubectl get service` and we should have a new service with the name specified in the `lb.yaml`

We can see the Load Balancer being created in the DO dashboard, and when it gets a IPv4 we are ready to hit it:

`curl [your_ip]`

Result:

`Hello from root!%`

#### HTTPS Load Balancing

To do this you would need to add a domain to DO. Then, you need to create a certificate they maintain (unless you want to use your own).

Now you can either create the HTTPS rule in the load balancer in the dashboard (forward to the same random port), or you can add the following to your `lb.yaml` file:

```yaml
kind: Service
apiVersion: v1
metadata:
  name: testcontainer
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-protocol: "http"
    service.beta.kubernetes.io/do-loadbalancer-algorithm: "round_robin"
    service.beta.kubernetes.io/do-loadbalancer-tls-ports: "443"
    service.beta.kubernetes.io/do-loadbalancer-certificate-id: "your-certificate-id"
...
```

#### Resources

Something super duper important that I haven't introduced you to yet in your deployment. When it comes to resources, you have `limit` and `requests`. If you only specify one, the other will assume the same config as the other. **Never have none.**

Let's modify our `deployment.yaml` file a bit:

```yaml
spec:
  containers:
  - name: testcontainer-deployment
    image: registry.digitalocean.com/testtime/testcontainer
    resources:
      requests: # Guaranteed, keep high enough to trigger autoscaling
        memory: "128M" # if exceeded, the pod could be evicted if the node runs out of memory for critical stuff
        cpu: "700m" # Average at load
      limits: # throttled (cpu is compressable resources) or killed (mem) at, could omit and raise requests
        memory: "256M" # kills if exceeded, will be restarted
        cpu: "900m" # will not be killed, will be throttled, this preserves 10% per cpu for other stuff
    ports:
    - containerPort: 8080
      protocol: TCP
```

Let's talk about 2 things: `cpu` and `memory`

`cpu` is known as a compressible resource, meaning we can throttle it when it is asking for more cpu. `memory` on the other hand is not, and when it is asking for more than we allowed it, that pod will get killed and restarted. The `cpu` are in units of `millicpus` -> `1000m = 1 core`.

We don't want to give our deployment all of the cpu and mem, because we have other stuff running on the cluster as well (like k8s...). This is why DO tells you that 'usable' portion of memory, they prevent you from using what the cluster requires by default. GKE and AWS's EKS, not so much.

Express tends to be far more CPU heavy than memory heavy anyway. To determine these requests and limits you have to run your app under some load and determine a good base level for what you need, and what your limits should be. Express also loves consuming about a single core (vs. 2 on half a core).

#### Autoscaling

There are 2 levels of autoscaling in k8s: `node autoscaling (NA)` and `horitzonal pod autoscaling (HPA)`

HPA creates more pods as required (more replicas), while NA creates more nodes when we don't have enough resources for more pods.

In the DO dashboard for k8s, go into your node pool and with the `...` enable autoscaling. This will add nodes when there are more pods scheduled than there are resources available in the node pool.

What is scheduled?

It means when your HPA asks for more pods to be created, but based on your requests the node pool can't spare any more resources. the NA adds nodes to give your cluster more resources.

So let's make an HPA

create a file called `hpa.yaml` and fill it like so:

```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: testcontainer
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: testcontainer
  minReplicas: 1 # min number of nodes (one for each node)
  maxReplicas: 3 # Same max nodes in node autoscaler*cores
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

A few things to note:

The formula for how many pods should exists is as follows:

`desiredReplicas = ceil[currentReplicas * ( currentMetricValue / desiredMetricValue )]`

From kubernetes.io:

_For example, if the current metric value is `200m`, and the desired value is `100m`, the number of replicas will be doubled, since `200.0 / 100.0 == 2.0`_

Here `desiredMetricValue` is the `targetAverageUtilization`, and any time we jump over a multiple of that value we add a new pod. Any time we jump below a multiple we drop a pod.

Using these in tandem allows for a highly elastic cluster to attend to the needs of your traffic quite quickly.

New pods come up near instantly, and new nodes take ~30s depending on the cloud provider.

Ok let's apply it:

`kubectl apply -f hpa.yaml`

Depending on what you had your replicas as for the deployment (I like to make them the min of the HPA), you will see the HPA added and the replica count change.

Run `kubectl get hpa` to verify.

#### Clean Up

Now if you are done with DO, you can delete the container registry, the load balancer, and the cluster to prevent any more charges.

## Google Kubernetes Engine

Let's get it. Create a project, make sure `gcloud` is installed.

_you may have to run `gcloud components install kubectl`_ if your `kubectl` isn't playing nice with gcloud.

### Create your Cluster

Go to Kubernetes Engine, let the API enable, and create your cluster. Most things can be default, except a few things to ensure:

- Use the newest version of the `Static version`
- Use `N1` nodes (cheapest)
- Enabled autoscaling (1 min, 3 max)

**Create**

now we wait...

### Configure `kubectl` for your cluster

Once your cluster is created, we can use `gcloud` to setup `kubectl`. Make sure you clear out your `KUBECONFIG` env var.

We need to login with `gcloud`, and tell it to use our new project by running:
`gcloud config set project [project-name]`

Where `[project-name]` is the id of the project (not the name you gave it)

We also need to run `gcloud config set compute/zone ZONE` and `gcloud config set compute/region REGION` based on where we made the cluster.

Now we need to get the configuration with `gcloud container clusters get-credentials [cluster-name]`

We can verify this worked with `kubectl config currnet-context`

### Deploy to Cluster

Now we don't even have to build our container if we don't want, we can let the cli do that for us (You can use `gcloud` and `docker` to manually build and submit the container if you want).

Run `gcloud builds submit --tag gcr.io/[PROJECT-NAME]/testcontainer .`

`testcontainer` is going to be the name of our container for the rest of the tutorial.

Now let's create our new `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: testcontainer-deployment
  labels:
    app: testcontainer-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: testcontainer-deployment
  template:
    metadata:
      labels:
        app: testcontainer-deployment
    spec:
      containers:
      - name: testcontainer-deployment
        # Replace $GCLOUD_PROJECT with your project ID
        image: gcr.io/$GCLOUD_PROJECT/testcontainer:latest
        # This app listens on port 8080 for web traffic by default.
        resources:
          requests: # Guaranteed, keep high enough to trigger autoscaling
            memory: "128M" # if exceeded, the pod could be evicted if the node runs out of memory for critical stuff
            cpu: "700m" # should be based on average usage of well balanced cluster, high enough prevent more than 1 per CPU (ex with 2 cpu 3x700 = 2100 > 2000)
          limits: # throttled (cpu is compressible resources) or killed (mem) at, could omit and raise requests
            memory: "256M" # kills if exceeded, will be restarted, make ~60% of ram per node/cores per node or set to prevent runaways
            cpu: "900m" # will not be killed, will be throttled, preserve 10% per cpu for other stuff
        ports:
        - containerPort: 8080
        env:
          - name: PORT
            value: "8080"
```

Then `kubectl apply -f deployment.yaml`

### Ingress and Load Balancing

#### Load Balancing

Let's make a normal load balancer for the service, make a file `lbg.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: testcontainer-lb
spec:
  type: LoadBalancer
  selector:
    app: testcontainer-deployment
  ports:
  - port: 80
    targetPort: 8080
```

Run `kubectl apply -f lkg.yaml` and wait for it to get a `EXTERNAL-IP` from `kubectl get service`

Then run `curl [your_ip]` and we should see good output!

#### HTTPS Load Balancing

You need to have a domain name to do this, so we won't practice, but I'll drop in the links:

https://cloud.google.com/kubernetes-engine/docs/how-to/managed-certs#setting_up_the_managed_certificate

https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer#step_3_create_an_ingress_resource

Basically you need to merge in the certificate specific stuff from the first link, into the load balancer from the second link.

You also can make a HTTPS load balancer from the k8s dashboard as well in GCP. You could actually enable HTTPS for the Load Balancer we created in the previous section from the dashboard as well.

For using the NodePort method for HTTPS you will still need to make that `ManagedCertificate` explained in the first link.

#### Autoscaling

We've already got the NA applied, now we just need the HPA. Make an `hpa.yaml` file:

```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: testcontainer-deployment
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: testcontainer-deployment
  minReplicas: 1 # min number of nodes (one for each node)
  maxReplicas: 3 # Same max nodes in node autoscaler*cores
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

Now we can check with `kubectl get hpa` and `kubectl get pods`.

**Question:** Why do we have 3 replicas if our HPA only requires us to have 1 right now? Why do we have 3 nodes if our NA requires only 1 right now?

**Answer:** Until the scaling up needs to happen, the set replicas and nodes basically becomes a floor. You can solve this by setting the amount of nodes we created, or the replicas to the floor of the autoscaler. That will have it drop back down to the floor before it needs to rise first.

### Cleaning Up

All we have to do is delete the project. Everything inside will delete and you will no longer be billed.
