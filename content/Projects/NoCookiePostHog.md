---
title: How to Set Up Cookie Free Post Hog Analytics
draft: false
tags:
  - guide
  - project
description:
created: 2025-12-27
modified:
holiday:
---
While Quartz has a helpful system that allows you to easily implement analytics for a given site simply by modifying `quartz.config.ts`, the system is set up for the default settings and passes arguments to the actual analytics elements which are stored inside `./quartz/plugins/emitters/componentResources.ts`. 

By default, PostHog uses cookies. Cookies require notice and opt-out features to to be legal in Virginia, and because I have no idea how that would work, find cookies annoying, and don't want to go to jail or be fine, I didn't want that them. Fortunately, PostHog has a [helpful guide](https://posthog.com/tutorials/cookieless-tracking) to using analytics without cookies. Unfortunately, that guide expects you to have implemented and/or PostHog yourself where Quartz hasn't done that.

Here's how to set up your PostHog project and Quartz website to use the built in cookie free option. This assumes that you've already set up a PostHog project and fed the appropriate provider, API key, and server host argument into `quartz.config.ts` analytics argument using the following format:

`{ provider: 'posthog', apiKey: '<your-posthog-project-apiKey>', host: '<your-posthog-host>' }`
# Step One: Enable Cookieless server hash mode
Open your PostHog settings and navigate to the Web Analytics section

Scroll down until you see "Cookieless server hash mode"

Set that to enabled.
# Step Two: Update componentResources.ts
Open your Quartz folder and navigate to ./quartz/plugin/emitters/componentResources.ts

Find your PostHog initialization function and add the following line to it `cookieless_mode: 'always'`.  The function should now look something like this:[^1]
```js
posthog.init('${cfg.analytics.apiKey}', {
	api_host: '${cfg.analytics.host ?? "https://app.posthog.com"}',
	capture_pageview: false,
	cookieless_mode: 'always',
});
```

From there you should be set. If you aren't, good luck ☺

[^1]: With the minor caveat that I've set this to style as javascript while your code viewer of choice will see it as a typescript file so the colors will be much less pretty
