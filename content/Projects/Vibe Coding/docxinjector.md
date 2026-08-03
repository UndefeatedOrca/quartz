---
title: Microsoft Office XML Injector
draft: false
tags:
  - tech/vibecoding
  - tech/server
description:
created: 2026-08-01
modified: 2026-08-03
---
Github repo: [UndefeatedOrca/docx-injector](https://github.com/UndefeatedOrca/docx-injector)

This is a docker container that I spun up in an attempt to prompt inject my local AI model using invisible instructions hidden in the customizable metadata of Microsoft office documents.

If you were wondering, no, it doesn't work for that purpose (I'm assuming because the way that these models read the documents is done using purpose built python libraries that don't care about the metadata at all), but it does work!

This container will both read and write hidden message in the XML which is obnoxious to read otherwise. Use this for evil, or preferably for good (if at all possible).

Installation is easy, download the repo and then:
```
docker compose up -d
```
If that doesn't work, make sure you have docker installed lol, it should list on port 8877

---
Who can say whether this piece of innovative technology will ever be used for something other than failed attempts at tomfoolery. The only way to find out is to test it out on documents you find in the wild.

---
Forgive the goofiness of the UI, I didn't take the time to make it pretty. If it makes you feel better, I vibe-coded a UI pass over what was an even worse display before pushing to you all lol.