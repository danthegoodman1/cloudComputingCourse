# Express and HTTPS <!-- omit in toc -->

This is going to be a quick one.

## Table of Contents <!-- omit in toc -->
- [Why HTTPS](#why-https)
- [Why Haven't We Been Using It?](#why-havent-we-been-using-it)
- [Different Methods](#different-methods)
    - [Express Handling](#express-handling)
    - [NGINX](#nginx)
    - [Cloud Hosted Load Balancers](#cloud-hosted-load-balancers)

## Why HTTPS

You know why. Unencrypted traffic is a death sentence (except in the case of a VPC, which is still not a good idea).

## Why Haven't We Been Using It?

Because it takes a little bit to setup every time. You can use what you learn below to implement it into anything we've worked on so far.

## Different Methods

#### Express Handling

For a quick and dirty method, we can have express handle HTTPS itself by directly accessing the key files.

First we need to generate these key files:

Then we need to tell express to use HTTPS, and where the key files are:

We also probably want to reject/reroute any HTTP requests to the API:

Now, we can navigate to our API using HTTPS:

This can also be used with a let's encrypt cert using certbot, but if you are going this far then you should probably use something like NGINX as well.

#### NGINX

A better method would be to place NGINX in front of express as a load balancer, and have it handle SSL termination. This way you can also quickly update your SSL cert (with something like certbot and let's encrypt) without having to restart your express instance(s).

#### Cloud Hosted Load Balancers

The most ideal and production ready way. Let cloud providers deal with SSL certs, and routing requests to different instances of your API.
