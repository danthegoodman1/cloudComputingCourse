# Lesson 2: Advanced Virtual Machines <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [What is Serverless?](#what-is-serverless)
- [Functions, Containers, and Serverless Abstraction](#functions-containers-and-serverless-abstraction)
- [Getting Started: Firebase](#getting-started-firebase)
- [Writing your first serverless function](#writing-your-first-serverless-function)
- [A more advanced serverless function](#a-more-advanced-serverless-function)

## What is Serverless?

The term serverless is a very bad misnomer. What does serverless require? _Lots of servers_. The term serverless really just mens server-independent. I won't waste your time here telling you about what serverless means. To keep it short, it basically means you abstract your code from what ever infrastructure it is running on, and you _generally_ run without any state.

## Functions, Containers, and Serverless Abstraction

As mentioned above, serverless is all about abstraction. Let's look at the example of the VM cluster we made last lesson, that was the least abstracted we could be. While the connection was VM instance abstracted, everything else was not. We chose the VM OS, VM specs, Networking, Disk, etc. TL;DR We chose everything about it besides the literal hardware.

The next level of abstraction is Containers. Containers are basically mini-VMs that run far lighter than normal VMs by sharing a Kernel (and some other magic). Containers essentially make your code completely portable to drop onto anything that can run Docker (or what ever container platform you are using). With containers, you still choose a lot. You choose what OS is running on the container, what is installed, the specs, networking (some of these things like networking and specs are mostly handled by cloud providers). This tends to be the sweet spot, because you get almost all of the benefits of a VM, with the portability that containers allow.

The final level of abstraction we will cover is Serverless Functions, what we are learning here today. Serverless functions are unique, as you write stateless functions that run based on certain events. Whether that be HTTP requests, DB updates, Pub/Sub message, etc., these functions are meant to be what they are: _Functions_, not programs. They are so abstracted that often you don't even choose the resources that these functions are allocated. Providers like Firebase (by Google) will say: "Give us your function, and we will run it for you when it needs to run." And that's it, you just write a single function that provides another layer of Microservies for your platform.

To learn Serverless, it's actually a bit easier to start with the most amount of abstraction now and work our way back down, you'll understand why when we get to Docker and Containers.

## Getting Started: Firebase

Head over to the firebase console at https://console.firebase.google.com and create a new project. Firebase projects are GCP projects, at any point in the creation of one, you can choose to link it to the other. Why not link this Firebase project to your GCP project you used in the last lesson if you haven't deleted it?

After you have created your project, initialize it in a local folder with the Firebase SDK:
- `firebase init`
- select your project
- enable functions and Firestore (leave everything else blank for now)
- Disable that built in eslint crap it's so annoying

You should now have a `functions` folder, this is essentially a Node.js project where you define functions that run. `cd` into that folder, and let's get to work

## Writing your first serverless function

Open the `index.js` file that is inside your functions, this is where you will write the entrypoint to all functions. You can still import other files in the same folder if needed.

Run `npm i -s express cors` to install the dependencies we will use.

We are going to write a function that is invoked by an HTTPS request. Firebase has built in HTTP request handling, however they also fully support express, so let's use that.

Functions are written inside the `index.js` file as `exports`. Exports, while done in many ways, are how you tell another file what functions it can import from this file. Let's write our first function:

```js
exports.testHTTP = functions.https.onRequest(app)
```

That was easy! Now we just have to write the `app`, which is just an express instance. Write this above the `exports` line:

```js
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({ origin: true })) // Allow cross-origin requests

app.get("/", (req, res) => {
    res.send("This is my serverless function!")
})
```

Great! Now we need to get this on Firebase. Run `firebase deploy` and let that finish. You should see a function url in the terminal output when it finishes, drop that into a browser (add a `/` at the end or you will get a `Cannot GET null` error) and you should see this:

![Screen Shot 2019-08-23 at 9.06.39 AM](/assets/Screen%20Shot%202019-08-23%20at%209.06.39%20AM.png)

If you got that response in your browser, great work!

## A more advanced serverless function

So now you should be able to build an API on Firebase functions if you wanted to, however that would not be a good use case for serverless functions, and it's about the least useful thing a function would be used for
