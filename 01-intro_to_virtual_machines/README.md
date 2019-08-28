
# Module 1: Intro to Virtual Machines <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Why We Use Virtual Machines](#why-we-use-virtual-machines)
- [Getting Started: DigitalOcean](#getting-started-digitalocean)
- [Getting Started: Google Compute Engine](#getting-started-google-compute-engine)
- [Put an Example app on the Instance](#put-an-example-app-on-the-instance)

## Why We Use Virtual Machines

Maintaining hardware is... *hard*. Networking is *hard*. There is a reason that people have jobs _dedicated_ to this stuff (although those jobs are dying because of cloud computing, IT is now blue-collar work).

The point? It is far more worth your time to let someone else deal with the low level hardware and networking, and just have platforms (with various levels of control, virtual machines giving you the most) that you can _drop code on and run it._

*In this Module* we will be learning about my two favorite Virtual Machine hosts (Google Compute Engine and DigitalOcean), how to get *securely* setup on each platform, how to put a web application on the virtual machine, and how to expose that machine to the world.

I'd also like to mention that while DigitalOcean can be used for production infrastructure (I and many other people have), it is better suited to development. This will become more obvious why as you go through the course but it is mostly for inter-service communication and orchestration.

## Getting Started: DigitalOcean

Get setup yourself. Make a project, add your ssh public key, make an Ubuntu 18.04 droplet with the lowest specs. and SSH in.

DO (DigitalOcean) makes it incredibly easy, you shouldn't need me to walk you through it. If you are stuck, google it (that's going to be a common theme throughout this course. If you can't google stuff, your dead in the water).

If you get stuck, I want you to google:
- "Put ssh keys on DigitalOcean"
- "How to make project on DigitalOcean"
- "How to make ubuntu droplet on DigitalOcean"

I am going to walk you through a lot of stuff in this course (plenty of which is google-able), but you need to be capable enough to do this.

You are going to ssh in with `root@[your-ip]`

## Getting Started: Google Compute Engine

This is where I have to start hand holding. You can definitely google this, and Google makes amazing documentation for _most of_ GCP (Google Cloud Platform), but it's going to be easier if I just show you some pictures (even more so if you are in class when it happens).

To add ssh keys to google, go ahead and make a google cloud platform project, go to `Compute Engine > VM Instances` and enable it, it's going to take a few mins.

To add ssh keys go to `Compute Engine > Metadata` then in the top select `SSH Keys` next to `Metadata`.

Click `Edit`, scroll to the bottom and click `add item`, and paste in your ssh key. Your key need to be in the format:
```
ssh-rsa rnaomdeyfwnufnewoufnwnegoweojfi... [username]@something
```

you will ssh into your machine as `[username]@[your ip]`.

Go ahead and make a vm instance now, here is what I need you to do:
- use the n1-standard-1 machine type (default)
- Boot disk: Change it to:
  - Ubuntu 18.04 LTS
  - Size: 25+ GB
- Firewall:
  - Allow HTTP traffic
  - Allow HTTPS traffic

THAT'S IT!

The SSH keys you specified in the Metadata section are project-wide. This means that any VM you create will, by default, have those SSH keys (you can disable project-wide ssh keys in the VM instance creation screen if you need to)

Your machine will be assigned a public IP that can change, it's not completely static like DO droplets are. We will cover this more in the networking part of this course, but to make a static IP address for a compute engine instance (it will cost more), go to `VPC Network > External IP Addresses`. At the top click `RESERVE STATIC ADDRESS`, give it a name, use what ever network tier you want, and in the `Attached To` dropdown select your instance. It will now take a few seconds to generate a new IP that will be to you instance as long as the instance lives (or until you remove the IP)

## Put an Example app on the Instance

I am going to use DO for this because it's easier to spin them up/kill them quickly. Plus it's cheaper.

Let's write a simple REST API in Node.js using express:

_I'm not going to put the code in here for this Module, it's not enough code to have a problem... I hope..._

- Make a folder, and run `npm init -y` in it to initialize the project
- Run `npm i -s express` to install express
- Create a file called `index.js` and write the following into it:
```js
const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.listen(8080, () => {
    console.log("Running on port 8080")
})
```

_If you are using GCE (Google Compute Engine) and wondering why you can't connect, it's because you need to make a firewall rule that allows network ingress on this port to your vm instance, we will talk about that later which is why I am using DigitalOcean._

Once you've got that code down, you can run it locally on your machine by using `node index.js`. Now go to your browser and type: `http://localhost:8080` and you should see your message.

Nice work so far!

Now we need to get that code onto the VM, in order to do this we need some carefully crafted commands:
- `scp index.js root@[your ip]:~/`
- `scp package.json root@[your ip]:~/`

Let's break these down. SCP is SSH for copying files, so we just copied over the `index.js` file and the `package.json` file. The reason we didn't use a * is because you never want to copy the `node_modules` folder. That can have tens to hundreds of thousands of files, and it would take an absurd amount of time.

Now ssh back into the VM, we gotta run some more commands:
- `curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`
- `sudo apt-get install -y nodejs` Those two will install Node.js 10.x
- `npm i` to install dependencies
- `node index.js` to run the app

Now, in your browser, navigate to `http://[your ip]` and you should see your message!

Awesome work! Make sure to delete your VM, and your static IP if you made one so you don't get billed if you aren't using anything (GCP can be tricky to find what is billing you, remember every time you make something otherwise you get hit with a nasty little bill at the end of the month)

**[Let's move on to the next Module!](../02-advanced_virtual_machines)**
