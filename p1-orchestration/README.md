# Project 1: Virtual Machine Orchestration <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Time to Orchestrate, Maestro.](#time-to-orchestrate-maestro)
- [The Architecture](#the-architecture)
- [Requirements](#requirements)
- [Grading](#grading)

## Time to Orchestrate, Maestro.

If you look into the features of the amazing App Engine, you can see they offer [Session Affinity](https://cloud.google.com/appengine/docs/flexible/python/reference/app-yaml#network_settings). I am a believer in totally stateless cloud architecture, but sometimes you are building something really fast and don't have time to design it that way from the ground up (hackathons, PoCs, prototypes). Maybe you are building a game server, and having a stateless design using a Firestore or Redis is not an option.

What if we made VMs that lived and died like Cloud Run containers or serverless functions? Full VMs with no restrictions. Dedicated IP addresses and very high resources spun up and down.

This is something that I prototyped for one of Andy's company projects, TraderEx. The existing codebase needed to have a persistent connection to an instance of the game, so all that was really needed was an infrastructure change.

## The Architecture

Design an API that can spin up, kill, and keep track of live VMs that run some sort of persistent connection service. Maybe it's a web-chat room, maybe it's a game server, what ever you want to make that requires persistent connections. _Note that these are not the best uses of this technology, and the practical use of VM orchestration is for very complex projects._ 

If you plan on using GCP, and Node.js, the `@google-cloud/compute` npm package is your friend.

If you are using DO then the `do-wrapper` npm package is your friend

## Requirements

- An API that can Create, Destroy, and List current in-use VMs
- VMs are launched with some sort of persistent connection service/app that others can use
- Demo-able in class
- Use GCP or DO (%5 bonus for using GCP since it's more production-grade and a little more involved in the initial setup)

## Grading

**Main (/100)**:
- API can create VMs on command/when required: 20 points
- API knows when a VM is no longer being used, and destroys VM: 30 points
- API can show current VMs: 10 points
- VMs run some sort of persistent service/app: 30 points
- Bug-free demo: 10 points

**Extra Credit (/5):**
- Use GCP entirely: 5 points

You will turn your code in as well, has no impact on grade unless you cheat with others. Also try not to write spaghetti code.

**This project is done individually.**
