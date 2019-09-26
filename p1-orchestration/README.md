# Project 1: Virtual Machine Orchestration <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Time to Orchestrate, Maestro.](#time-to-orchestrate-maestro)
- [The Architecture](#the-architecture)
- [Requirements](#requirements)
- [Grading](#grading)
- [2 Week Check-in](#2-week-check-in)

## Time to Orchestrate, Maestro.

<!-- If you look into the features of the amazing App Engine, you can see they offer [Session Affinity](https://cloud.google.com/appengine/docs/flexible/python/reference/app-yaml#network_settings). I am a believer in totally stateless cloud architecture, but sometimes you are building something really fast and don't have time to design it that way from the ground up (hackathons, PoCs, prototypes). Maybe you are building a game server, and having a stateless design using a Firestore or Redis is not an option.

What if we made VMs that lived and died like Cloud Run containers or serverless functions? Full VMs with no restrictions. Dedicated IP addresses and very high resources spun up and down. -->

What if we wanted to build an online service/app that needed virtual machines on demand to handle auto scaling, but seemed like a single server? What about a serverless chat app? Stateless VMs is what we are after.

Now we want to handle the orchestration ourselves. Similar to the Discord example, we need to manually manage the life cycle of VMs. This includes listing, creating, destroying, and health checking.

This is something that I prototyped for one of Andy's company project, TraderEx. The existing codebase needed to have a persistent connection to an instance of the game, so all that was really needed was an infrastructure change. And a VM manager API.

Now it's time to work like a real developer and Backend Architect... Google a lot. If I give you the terms and requirements, you should be able to Google your way to completion.

## The Architecture

Design an API that can spin up, kill, and keep track of live VMs that run some sort of persistent connection service. Maybe it's a web-chat room, maybe it's a game server, what ever you want to make that requires persistent connections. _Note that these are not the best uses of this technology, and the practical use of VM orchestration is for very complex projects._ 

The `@google-cloud/compute` npm package is your friend.

<!-- If you are using DO then the `do-wrapper` npm package is your friend -->

## Requirements

- An API that can Create, Destroy, and List current in-use VMs (this can be done with just GET/POST/Delete request using postman, no UI needed)
- VMs are launched with some sort of persistent connection service/app that others can use (super simple web UI, as a backend engineer you need to be able to do a little bit of everything to make sure your back end and front end work cohesively)
- Demo-able in class
- Use GCP, learning a real production cloud provider is essential. GCP is easier to use.
- Authentication required to access app (could be a pre-defined username/password, 2fa, API key, etc.)
- Python or NodeJS (Hint: use NodeJS)
- Can connect to any VM, VMs can communicate between (Hint: maybe user Firebase? Or Google Cloud Pub/Sub?)

## Grading

**Main (-/100)**:
- API can create VMs on command/when required: **20 points**
- API knows when a VM is no longer being used or is not working (health checking), and destroys VM: **20 points**
- API can show current VMs: **10 points**
- VMs run some sort of persistent service/app that communicates between all VMs: **20 points**
- Bug-free demo: **10 points**
- Creativity/Difficulty of project outside requirements: **10 points**
- Authentication working **10 points**


These are pretty loose requirements, but make sure you fulfil them. You will turn your code in as well, it has no impact on grade unless you cheat with others. But try not to write spaghetti code.

**This project is done individually. You have 4 weeks to complete. Complete the backend architecture first (create, list, destroy VMs) in 2 weeks for a check-in.**

## 2 Week Check-in

You should have an API that can `list`, `create`, and `destroy` VMs on demand. The VM that is deployed should be running some sort of hello world webserver (maybe use express and nodejs), so have it boot from a custom image that has been made.

Here is some sample code you need for making VMs with a custom image. When you get into the API for creating VMs you will know where this goes:

```js
'disks': [
        {
            'kind': 'compute#attachedDisk',
            'type': 'PERSISTENT',
            'boot': true,
            'mode': 'READ_WRITE',
            'autoDelete': true,
            'deviceName': name,
            'initializeParams': {
                'sourceImage': 'projects/[PROJECT_NAME]/global/images/[CUSTOM_IMAGE_NAME]',
                'diskType': 'projects/[PROJECT_NAME]/zones/us-east1-b/diskTypes/pd-standard',
                'diskSizeGb': 30
            }
        }
    ],
```
