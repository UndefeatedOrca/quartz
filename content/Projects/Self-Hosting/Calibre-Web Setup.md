---
title:
draft: false
tags:
  - tech/server
description:
created: 2025-12-14
modified:
---
Today I’m going to tell you about Calibre Web, a web server meant to provide an aesthetic client for your ebook server that’s better than slightly clunky dedicated content server that’s packed with Calibre by default.

*for those not in the know: Calibre is the go-to ebook management software*

After successfully installing Calibre over the break, I decided that the next step was obviously to install Calibre Web and so went about that task with something approximating gusto.

First, I went to the official site and copied the Docker Compose .yaml file that I can easily plug into Portainer to activate everything as intended:

```
---
services:
  calibre-web:
    image: lscr.io/linuxserver/calibre-web:latest
    container_name: calibre-web
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DOCKER_MODS=linuxserver/mods:universal-calibre #optional
      - OAUTHLIB_RELAX_TOKEN_SCOPE=1 #optional
    volumes:
      - /path/to/calibre-web/data:/config
      - /path/to/calibre/library:/books
    ports:
      - 8083:8083
    restart: unless-stopped
```

Then I plugged in the requisite file paths so that the bind mounts would work:

```
    volumes:
      - /home/patrick/docker/calibre/config
      - /home/patrick/docker/calibre/config/Calibre Library
```

Then I sat back and waited for the image to load. Before long, I had a working Calibre Web server. I opened it up in my browser on the 8083 port and waited in anticipation. Up popped the login screen. I needed a username and password. Somewhat confused, I checked the documentation:

> Log in: Use the default admin credentials:  
> Username: admin  
> Password: admin123

Excellent, just one step left, time to find my Calibre database and get this show on the road.

> New db location is invalid, please enter valid path

Oh no.

> New db location is invalid, please enter valid path

Oh no.

Something was wrong. The first problem I thought I might have was from the name of the folder: “Calibre Library.” Spaces do weird things to file names, and so I decided to rename my library to “calibrelibrary” a more low-key name surely more appropriate to use in a file system.

Well, after duplicating the folder and giving the duplicate a new name, I booted up Calibre and made the library switch from the one folder to the other. So far, so good.

Then I booted up Calibre Web, input the admin password, and put in the new database file path.

> New db location is invalid, please enter valid path

Oh dear.

Something else was wrong.

I asked copilot and it told me that the problem was either that I had the wrong path inside the container or that there was permissions mismatch. A cursory glance at my bind mounts indicated that my problem wasn’t the file paths, which were all input correctly, so I assumed that the issue was in the permissions.

*readers technically knowledgeable are hopefully laughing and not crying at the falsehood of that last sentence*

{It was at this point yesterday that I gave up and went to bed because I was unwilling to figure out file permissions; ironically, they were not at all complicated}

After a brief look at best practices for how to operate users in container environments, and a crash course in the chown command, I created a new folder called calibre-web only to realize that the problem was actually in the folder where the Calibre library was, and there was no reason to create this new folder.

*people with technical knowhow are probably laughing at this as well*

After deleting the copy of my library that I had made (it took two attempts because I forgot I was in my home directory and not the dockerdata folder). I went back to the folder with my Calibre library and attempted to change the file permissions so that the folder was owned by user 1000 in group 1000 using the following command:

chown -R 1000:1000 calibrelibrary

We were back in business, except the command didn’t spit anything to the command line, and the permissions were totally unchanged when I checked them.

What?

Cursory research quickly indicated that the reason nothing had changed was because I was user 1000, there only user 1000, and that the problem definitely didn’t related to user 1000 because I, user 1000, already owned the folder the files were in.

huh.

It was time to look harder.

It was time to find the actual solution.

After looking at the bind mounts even harder, and asking copilot to double check all of my work, I realized that I should actually be inputting “/books” into the database slot. That was progress.

The other thing that was progress was realizing that I had made a mistake in my .yaml file when I set up the container. I had directed the stack to look at my Calibre containers config file to find the config file for Calibre Web. Seemed suboptimal. After creating a new folder for Calire Web’s data, I rewrote my .yaml file. And then I rewrote it again. I had realized the real mistake that had been tripping me up this whole time.

My container had no internal structure. My file looked like this:

```
    volumes:
      - /home/patrick/docker/calibre/config/calibrelibrary
      - /home/patrick/docker/calibre-web/data
```

When it was supposed to look like this:

```
    volumes:
      - /home/patrick/docker/calibre/config/calibrelibrary:/config
      - /home/patrick/docker/calibre-web/data:/books
```

And without that, when I input “/books” as my database location, the container would look at me like I’d lost my mind (which I guess I had).

I booted up Calibre Web one last time, and saw green flash when I threw “/books” into it. I had won. Calibre Web was operational. The library appeared. All was well.

And things started lagging.

It kicked me from the website a couple times. Odd. It was rather slow. That was fine, the home internet had been spotty. Then Portainer stopped working. Odd. I pinged it from my computer. Nothing. Ping again:

> Destination host unreachable

Strange.

Then I turned the server off and on again; for a brief instant, the server once again responded to pings. Then:

> Request timed out.  
> Request timed out.  
> Request timed out.  
> Request timed out.

Oh boy.

I’m not sure if the wifi was slow for a while or if the problem was actually Calibre Web. Either way, I restarted again, opened Portainer as fast as I could and then stopped all of my containers except Portainer.

Happy to say that I’m now getting responses to the pings