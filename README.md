# The Open-Source Cloud Computing Course
Made with ❤️ by Dan The Goodman

## Who am I?

Well, I'll introduce myself. My name is Dan Goodman and I am a Co-Founder, and Development Lead of Anchor Security Team, and Co-Founder and CTO of Manhattan Space, Inc. To keep my experience list short, I've worked as a security engineer intern Freshman year of college where I made some very serious contributions and additions to their code base _(NDA...)_. I am the Red Team Champion of the 2018 DoE Cyber Force Competition. I wrote the Delaware SBDC's (Small Business Development Center) cyber material, which won [national awards from NIST](https://csrc.nist.gov/Projects/FISSEA/Contests-and-Awards/FISSEA-SATE-Winners) _(2019 - Delaware SBDC – Data Assured Program)_, is used by 8+ (at time of writing) other state SBDC's, the SBA, and is considered best practices by the Deparment of Homeland Security. I am a programming and cloud computing nut, and spend every moment I can spare learning.

So what does that mean? I've learned **a lot** about cloud computing. Through *(tens of?)* thousands of hours and my experiences with developing production-ready code that can "scale infinitely", pen-testing the hell out of everything I'm allowed to, and years of making my own Linux and virtualization rack-mount servers in my basement.

## What is this Course?

This course is designed for CPEG 473/673 Cloud Computing and Security, and to go in parallel with the Cloud Computing VIP program at the University of Delaware, so if I am skipping over topics or steps, it may be because I am showing them in class or video.

Here we will focus less on becoming Cloud platform experts, and more on the practical knowledge and skills required to launch your project or startup without having to hire dedicated cloud engineers. (Obviously at the scales of Twitter and Netflix infrastructure becomes so complex that you need many people just to manage infrastructure)

These modules will get you started in all of the areas you need to build something real, and ship it. Whether you are launching a service as a tech startup, building a personal project, or are adding on a new product to an existing company, these modules will get you started.

For much deeper dives into these topics check out linuxacademy.com for really detailed tutorials on each of the technologies.

I hope that through this course I can share my knowledge with you, and you can power-up in the amazing world that is cloud computing. Improve your skill set, put "Cloud Computing" on your resume, and flex on all of your developer friends.

Feel free to make a pull request! I'd love to add topics that I haven't yet covered or am not an expert enough in to teach yet.

Made with ❤️ by Dan The Goodman

## What You Will learn

I'm going to try to teach you everything you need to launch a tech startup, work for a giant company, or build a side project. This will include:

- **Databases** like Cassandra/Scylla clusters, Firestore, Datastore, and SQLite
- **Server-client communication** with HTTP/S, Pub/Sub, and secure Websockets to build powerful APIs
- **Distributed Computing** through manually clustering Virtual Machines, Serverless Functions, Docker, Kubernetes, Rancher, Google Cloud Run, Google App Engine, and event triggered workers
- **Supportive technologies** like Full-text search indexing with Apache Solr, Algolia, and custom built solutions, as well as interfacing with third party APIs
- **Security** in Multi-factor Authentication, Secure password handling, OAuth2, RBAC, and Security keys
- **Secure Development Life Cycle** with CI/CD, secure database/resource access, and secure key/token handling
- **Front End** with a sprinkle of HTML, JS, CSS, and React throughout the modules

We'll also do some fun projects:

- **Build a custom VM cluster and autoscaler**
- **Build a serverless websocket chat app**
- **Build a simple Virtual Assistant like Google Home, Siri, and Amazon Echo (Alexa)**

## What Is Expected

- Some JS/Node.js, HTML, and Python
- Basic concepts like web requests
- Basics of Objects and Classes
- Basic Linux and terminal usage
  - SCP, SSH *(Try the VS Code SSH extension, best thing ever)*
  - How to move and execute code in a terminal *(play buttons are for noobs)*

Write your own code. While you will be googling and copying a lot of code in the future, just write it yourself. You don't learn anything from copy pasta 🍝.

**You want to learn.**
I hope that if you are here, it's because you want to understand cloud computing, and implement it in the future. I would argue cloud computing is just as (if not more) important as coding itself or any other technical skill in the world of development: _**If you can't deliver your code to anyone and everyone who wants to use it, your code is basically useless.**_
*But I'm probably a little biased.*

## Modules

1. [Setup and Requirements](/setup_and_requirements)
2. [Intro to Virtual Machines](/intro_to_virtual_machines)
3. [Advanced Virtual Machines](/advanced_virtual_machines)
4. [Welcome to the World of Serverless: Serverless Functions](/serverless_functions)
5. [Firestore and NoSQL Data Modeling](/firestore)

**P1. [Project 1: VM orchestration](/orchestration)**

5. [App Engine and Delegated Tasks](/app_engine)

**C1. [Case Study 1: Discord](/c1-discord)**

6. [Docker Intro](/docker_intro)
7. [*RancherOS - Building your own Kubernetes Cluster](/rancher)
8. [*Serverless Containers With Cloud Run](/cloud-run)
9. [*Kubernetes](/kubernetes*)
10. [*Intro to Full-text Search Indexing](/indexing)
11. [Apache Solr](/apache-solr-indexing)
12. [ElasticSearch](/elasticsearch)
13. [Cassandra/Scylla](/cassandra-and-scylla)
14. [Cassandra/Scylla Clustering](/scylla-clustering)

**C2. [Case Study 2: SaaS](/c2-saas)**

15. [Authentication and Logins](/authentication-with-jwt)
16. [2FA - Securing the Cloud](/2fa)
17. [*Pub/Sub & MQTT](/pubsub)

**P1. [Project 2: Secure Scalable Service](/p2-secure-scalable-service)**

17. [*MongoDB](/mongodb)
18. [*The Secure Development Life Cycle and CI/CD](/secure-development-life-cycle)

<!-- 13. Secure Development Life Cycle (include dev keys vs. prod keys, secure token/api key handling) -->

<!-- 11. Infrastructure as Code - APIs and Terraform? -->
<!-- 1.  [Cloud Run and Stateless Containers](/08-cloud_run) -->
<!-- Google cloud datastore and dynamoDB -->
<!-- 2.  [Google Kubernetes Engine](/09-gke) -->
<!-- 3.  [Pub/Sub & MQTT - Cloud Messaging](/11-pubsub) -->
<!-- 4.  [Cloud Storage - Objects in the Cloud](/12-cloud_storage) -->
<!-- P2. [Project 2: TBD](/p2-) -->
<!-- 13.  [DialogFlow - Build your own assitant](/13-dialogflow) -->
<!-- P3. Build a simple digital assistant -->
<!-- MongoDB -->

## Contributors

[Dan The Goodman](https://github.com/danthegoodman1)

## How Do I Contribute?

Make a pull request!

Make sure the `README.md` file is in a similar format to the ones you see in the existing modules.
