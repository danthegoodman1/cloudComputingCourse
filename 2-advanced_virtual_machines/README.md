# Lesson 2: Advanced Virtual Machines <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Basic Clustering](#basic-clustering)
- [Building the Instance Image](#building-the-instance-image)
- [Building the Instance Template](#building-the-instance-template)
- [Building the Cluster](#building-the-cluster)
- [Balancing the Cluster](#balancing-the-cluster)

## Basic Clustering

This is something we will explore under more serverless-style cloud computing lessons, but to keep it simple, clustering is important. What happens if you VM goes down? Your service goes down. This can't happen. _The show must go on!_ In order to reduce the chance that your entire service goes down, we use clustering. Clustering is essentially a bunch of machines, called `workers` or `nodes` or `slaves` that are hidden behind a `load balancer`. The client connecting to the cluster then hit the dedicated IP or domain of the load balancer, which determines which worker to send the connection to. Then the worker sends the response back to the load balancer, which returns it to you. Let's look at a diagram:

![Clustering Diagram](/assets/Untitled%20Diagram%20(1).png)

As you have have guessed from the above diagram, we are going to be building this cluster on GCP. It is easier for GCP, and we'll be making a cluster that is _fully production grade_.

## Building the Instance Image

In order to make the cluster, we have to start by making a disk image with our code already on it and running, that we can copy to other machines. So lets go ahead and make a near default Compute Engine instance with only these changes:
- Disk image: Ubuntu 18.04
- Allow HTTP Traffic
- Allow HTTPS Traffic

Once that is created, ssh in.

- Make a folder, and run `npm init -y` in it to initialize the project
- Run `npm i -s express` to install express
- Create a file called `index.js` and write the following into it:
```js
const express = require('express')
const os = require('os')

const app = express()

app.get('/', (req, res) => {
    res.send(os.hostname())
})

app.listen(80, () => {
    console.log("Running on port 80")
})
```

Now we need to get that code onto the VM, in order to do this we need some carefully crafted commands:
- `scp index.js root@[your ip]:~/`
- `scp package.json root@[your ip]:~/`

Now ssh back into the VM, we gotta run some more commands:
- `curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`
- `sudo apt-get install -y nodejs` Those two will install Node.js 10.x
- `npm i` to install dependencies
- `sudo node index.js` to run the app (we need sudo to run on any port below 1024, we are using 80)

Now, in your browser, navigate to `http://[your ip]` and you should see the name of your instance

We need to install `pm2` now, which will handle making sure our app runs on boot:
- Run `sudo su` so we can run as root
- Run `npm i -g pm2`
- Run `pm2 start index.js --name testApp` This will have pm2 manage our app
- Run `pm2 ls` to see the running process
- Run `pm2 startup` this will enable pm2 to run on boot
- Run `pm2 save` this will save the current processes to be ran when pm2 starts

Now you can exit from the SSH session and head over to the Compute Engine panel in GCP.

We want to go ahead and shut down the VM so we can save the instance image. Click the check box next to the image, then stop in the top menu.

Once the VM stops, click on `Images` in the left menu (or `Compute Engine > Images`)

To create an image from our instance, click `CREATE IMAGE` in the top menu. Give it a name, and for the source disk select your instance. Then click create. This will take a bit.

## Building the Instance Template

Now we need to make the template that our cluster workers will be made from. Go to `Compute Engine > Instance templates` and click `Create instance template`

The only thing to change is the disk: Make it `Custom Images > [your image name]`

Don't forget to allow HTTP and HTTPs traffic as well, and click `Create`

## Building the Cluster

Go to your GCP project and navigate to `Compute Engine > Instance groups`, and click `Create instance group`

Select the instance template, and set the maximum number on instances to 3, and minimum instance to 2 (to save some money). Make sure Autoscaling is on.

Now click `Health check > Create a Health Check` and set the following:
- Protocol: HTTP
- Port: 80
- Request path: /

Click `save and continue`

now click `create`

## Balancing the Cluster

Now we need to create the load balancer, which will also give us HTTPS (really important!). To do so navigate to `Network Services > Load balancing` and click `Create load balancer`

Click `Start configuration` under `HTTPS load balancing` and then `Continue` in the first question. Do the following:

- Backend configuration
  - Backend Services
    - Create a backend service
      - in the instance group dropdown select the instance group you made, select the health check you made and click `create`
  - Frontend Configuration
    - protocol: http
    - port: 80
    - Click `Done`

Click `Create`

Now click on your load balancer, and copy in the IP. After waiting for like 10 minutes, navigate to `http://[yourip]` in the browser, and you should get a response.

Now keep refreshing, it should change as you get routed to the different workers in the cluster.

**BOOM!** You just made a production ready VM cluster pretty dang fast. We didn't do HTTPS because I didn't want you to have to wait for the certificate to validate before we could use the cluster, but that shouldn't be something I need to walk you through since in the menu of the load balancer creation it does a good job of that.

Don't forget to delete everything you made, the image, the instance template, instance group, instances, static IPs, and load balancer so you don't get caught in billing

** [Let's go on to the next lesson]() **
