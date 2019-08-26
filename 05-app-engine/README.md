# Lesson 5: App Engine <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [What is App Engine?](#what-is-app-engine)
- [Getting Started With App Engine](#getting-started-with-app-engine)
- [Stepping Up The Game](#stepping-up-the-game)

## What is App Engine?

[Google's App Engine](https://www.google.com/search?ei=h15kXYe3FcTO5gKf4K6ADw&q=app+engine&oq=app+engine&gs_l=psy-ab.3..35i39l2j0j0i20i263j0j0i67j0l2j0i67j0.8506.8757..8917...0.2..0.87.154.2......0....1..gws-wiz.......0i71.bV-AceO6qe4&ved=0ahUKEwjHlpObzKHkAhVEp1kKHR-wC_AQ4dUDCAo&uact=5) is awesome. Like really, truly, awesome. Imagine a world where you can write the code you want to run in the cloud, and someone takes care of all of the rest. That is literally App Engine. Using one service, you get most of the flexibility of virtual machines if you want it, but start with the simplicity of writing a normal web app.

By taking your code, containerizing it, placing it on load balanced, SSL secured, and entirely managed VMs, Google makes your code nearly indestructible and infinitely scalable.

We will be using the flexible environment, vs the standard. It's just... better.

## Getting Started With App Engine

This is where the gcloud cli is very important. In a production environment, you will almost never use it (you would use CD/CI instead). With that being said, let's get started.

We need to write a basic API, so let's grab the one we had earlier in the course:

Run `npm init -y` and `npm install -s express` to get started. Then make an `index.js` file with the following:

```js
const express = require("express")

const app = express()

app.get("/", (req, res) => {
    res.send("Welcome to App Engine!")
})

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening!")
})
```

We also need to make sure your `package.json` file has a `start` script that looks like the following:
```js
start: "node index.js"
```

Hopefully by this point you can figure out yourself how to add npm scripts to your `package.json` file

Now we need to setup the gcloud cli. Run `gcloud components update` to make sure you have the latest installed.

Now we need to select our project, so once you have your project made in GCP, run `gcloud config set project [your project id]`. This will make it so we don't have to use the `--project` flag in all of our other commands.

Now we need to initialize App Engine, so run `gcloud app create`

Now imagine if deploying your code to App Engine was as simple as running `gcloud app deploy`. Well it is, so run that.

Once that is completed (it does take a while), either find the link in the console, or run `gcloud app browse` to have your default browser navigate to your App Engine.

_How cool is that!?_ You just made a hello world app that will scale to the alloted quota you have for VMs in GCP. Better yet it was SSL secured, and is the most mature and capable platform for running a production-grade API from.

## Stepping Up The Game

Alright so we made our nifty little hello world, now it's time to make it do something.
