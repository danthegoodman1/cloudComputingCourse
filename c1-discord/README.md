# Case Study 1: Discord

How does Discord, the Gaming Communications platform that took the world by storm, scale so quickly and efficiently? How do they handle all of the traffic and data they have today?

It may not seem like it, but companies/products like Discord could never exist if their infrastructure couldn't handle it. They scaled to millions of users in a few months. This is a perfect example of how it doesn't matter how great your service is if nobody can use it.

Let's think of a few examples on the *bad side*. Video game releases. Notorious for failure to predict infrastructure needs and often don't employ modern infrastructure scaling techniques to handle such a drastic load. I can think of a few examples: Overwatch, Destiny, Sea of Thieves, etc. The list goes on of good games who had their launches ruined by poor infrastructure. *Come on Blizzard, if I have to wait in line just to LOG IN there is an infrastructure problem...* For something like a low-latency game server, a VM (or should I say a persistent Linux OS install. Not only is it (mostly) static in cost, but they are very easy to duplicate across hardware. You can also have larger machines that host multiple sessions. Discord took the modern approach and said:

*Let's use a cloud provider (GCP in their case), and have a system that dynamically assigns VMs to sessions, as well as spins them up/down as they are needed. But we always have more overhead than needed in case VMs crash or get DDoS attacked.*

If video game studios used the same concepts as Discord had they would never have this problem.

TL;DR: Start with way more compute than you need and let auto scaling bring it back down.

## Handling the Data - How they do it vs. alternatives

It all starts with considering how data will be handled.

Talk about the DB, P2P vs using their servers (privacy/security, bandwidth (draw diagram example))

## A Custom Version of Serverless

Sometimes we need literal VMs. Sometimes, even though there are hundreds of service offerings from a Cloud Service Provider, VMs are just the best fit. Sometimes you need to spin them up and down fast, while having the infinite life and use capabilities the VMs offer over containers and Serverless stuff. Sometimes you can't even deal with a load balancer, even with [session affinity](https://cloud.google.com/load-balancing/docs/https/#session_affinity). Sometimes, you just need *raw VMs*.

But we can make all of these other service ourselves... in fact we can make custom versions that do exactly what we want.
