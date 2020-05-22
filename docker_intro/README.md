# An Intro to Docker <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Why Docker?](#why-docker)
- [Your first Container](#your-first-container)
- [Uploading to Dockerhub](#uploading-to-dockerhub)
- [Pulling other containers](#pulling-other-containers)
- [Another Assignment](#another-assignment)

## Why Docker?

We've been working with very high levels of abstraction previously. Docker is hard to place. On one end, it's has extremely high abstraction because it can run on anything that supports Docker. On the other end, it's very low abstraction because you have raw access to the OS underneath, which means there are many additional things you have to consider. If you are interested in how Docker works, go look that up.

## Your first Container

Docker containers are defined by a file called a `Dockerfile`. Here is an example:

```docker
FROM node:10

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD npm start
```

Pretty simple, you can see it's very similar to a bash file (pretty much all Docker base images are Linux/Unix, so bash is the expected language). This Docker file just tells Docker that when it builds, it needs to use the base image `node:10`, set the working directory to `/usr/src/app`, copy all of the files in the local directory to the workdir, run the command `npm install`, then on container start run `npm start`.

I think Docker seems intimidating because of the layer of abstraction you need to keep in mind, and the extra commands you have to run to build/run your code the first time, but everyone who uses Docker loves it.

**So let's build our first container**

First we need an application to run. Let's grab our trusty old hello world express app:

```js
const express = require("express")
const app = express()

app.get("/", (req, res) => {
    res.send("Hello from my Docker container!") // Customize this!
})

app.listen(8080, () => {
    console.log("Listening on port 8080 on the container!")
})
```

Go ahead and customize the response message with your name, or something very unique. We are going to be running each other's Docker containers in a bit.

Next we need a `Dockerfile`. This one is going to be a bit different so when you make modifications you don't have to `npm install` every time. Docker builds cache steps that don't change:

```Docker
FROM node:10

WORKDIR /usr/src/app

COPY package.json package*.json ./

RUN npm install

COPY . .

CMD npm start
```

And go ahead and make a package.json file that has the `express` dependency and a `start` script that runs `node index.js`

**Now we need to make this into a container**

Using the Docker cli, we can run the command from the same directory as the `Dockerfile`:

`docker build -t testAPI .`

This command will take a few minutes to run and you will have a Docker container ready to go shown by running the command: `docker image ls`

To run the container, we use the command: `docker run -p 7777:8080 -d testAPI`

_Lets break down this command real quick_. the `-d testAPI` says what Docker container to use. The flag `-p 7777:8080` tells Docker to map our local port `7777` to the Docker container's port `8080`.

Now that this is running, in a browser open `http://localhost:7777` and you should see the response from your Docker container API.

To stop the container, run: `docker kill [your image name]`

## Uploading to Dockerhub

Now we may want to share our container with the world, so we need a platform to do that. Dockerhub is similar to Github but just for Docker containers.

To push to docker hub, we first need to login: `docker login --username=[your username] --email=[youremail@email.com]`

Now we need to add a tag to our image to let others know what version of the container they are using:
`docker tag [your image ID] [your username]/[your image name]:latest` This tells others that they are using the latest version of your container.

Now we just need to push the container up: `docker push [your username]` and now it lives on Dockerhub. You can see it from the website.

## Pulling other containers

Alright get a partner, or someone else who has Docker installed. Tell them to pull your container by running `docker pull [your username]/[your image name]` (by default it will pull the version tagged `latest`), and running it with the same run command used previously. Then have them navigate to `http://localhost:7777` on their browser (or curl for all I care) and they should see your message.

## Another Assignment

Hopefully you understand the basics of Docker and how you can use it's functionality. Now I want you to try to build something more substantial, and bring it to next class.
