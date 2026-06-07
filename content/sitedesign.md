---
title: The Design and Customization of this Site
draft: false
tags:
  - tech/quartz
description:
created: 2025-12-23
modified: 2026-06-05
---
I've used most of the Quartz defaults, but there are a few modifications. 

All code is available at the [github repository](https://github.com/UndefeatedOrca/quartz).
# Current Modifications and Customizations
## Custom Favicon
Using GIMP, I edited a picture of myself with glasses on the back of my head such that it looked like that was my head, and then a minor color modification of the blue glasses created the [favicon](https://en.wikipedia.org/wiki/Favicon) that you see today.

Is it good? 

shhhhh
>[!info]- context
>This is the icon
>![[icon.png]]
>I feel obliged to include this after my father read this page and thought I was crazy because nowhere on the actual website was this image findable.
>And yes, I somehow failed to select parts of the ceiling tile seams when I was making this in [GIMP](https://www.gimp.org/), sue me.

## Analytics
I opted to use PostHog analytics for the site, for three reasons:

1. It's free for any realistic usage I might have
2. It looked better than [GoatCounter]([GoatCounter – open source web analytics](https://www.goatcounter.com/))
3. The design of their [website](https://posthog.com/) was really cool and suggested that the company was fun[^1]

I, technical imbecile that I am, have no idea what most of the stuff on my dashboard does in any way. What I do know is that implementing it was more difficult than I would have liked. As I learn how the dashboard works, I'll update this section.

To learn how to implement cookie free PostHog analytics for your Quartz installation, go here: [How to Set Up Cookie Free PostHog Analytics](nocookieposthog.md)
## Accessibility Features
Vibe-coded plugin that offers a (hopefully) growing number of accessibility and quality of life features for readers. Current features are a font switcher for Comic Sans, Open Dyslexic, and Atkinson Hyperlegible and a beeline adjacent reading mode. Hopeful future features include a reading ruler, paragraph shader, and line and letter spacing configuration. 

Repo here: [UndefeatedOrca/quartz-accessibility-suite](https://github.com/UndefeatedOrca/quartz-accessibility-suite)

Install with this:
```shell
npx quartz plugin add github:UndefeatedOrca/quartz-accessibility-suite
```
## Random Note
Vibe-coded plugin that adds a random note button to the toolbar alongside the dark mode and reader mode controls. In addition to directing the user to a random page, the die icon randomly rolls when clicked, providing a helpful quality of life feature for users who need dice and only have access this site.[^2]

Repo here: [UndefeatedOrca/quartz-random-note](https://github.com/UndefeatedOrca/quartz-random-note)

Install with this:
```shell
npx quartz plugin add github:UndefeatedOrca/quartz-random-note
```

>[!bug] Installation Note
>In order to have the button appear in your toolbar and not below your explorer, you must add `group: toolbar` to the layout configuration in quartz.config.yaml so that it looks like this:
>```yaml
>- source: github:UndefeatedOrca/quartz-random-note
>   enabled: true
>   options:
>     label: Open a random note
>     includeCurrentPage: false
>   order: 50
>   layout:
>     position: left
>     group: toolbar
>     priority: 55
>``` 
## File Direct Downloads
[Vibe-coded plugin](downloadtransformer) to make links direct downloads when they aren't images, pdfs, or markdown.

Repo here [UndefeatedOrca/quartz-download-links](https://github.com/UndefeatedOrca/quartz-download-links)

Install with:
```shell
npx quartz plugin add github:UndefeatedOrca/quartz-download-links
```
## Parent and Child Tag Links
When you look at a tag page, at the top you'll see links to any parent or child tags. This is helpful for two reasons
1. You might want to read all of the nature poems but found one about snow first. Default Quartz requires you to manually edit your url to find the nested tag.
2. Sometimes I misspell tags and the only way to find the rest of tags is to look in the parent and verify that there's no strange modifications

While in Quartz 4 this was done by modifying ./quartz/quartz/components/pages/TagContent.tsx, in Quartz 5, with Tag Pages implemented in the plugin system, I had to fork the TagPages plugin. 

Repo here: [UndefeatedOrca/tag-page-genealogy](https://github.com/UndefeatedOrca/tag-page-genealogy)

Install with:
```shell
# remove existing tag page plugin
npx quartz plugin remove tag-page
# add the forked plugin
npx quartz plugin add github:UndefeatedOrca/tag-page-genealogy
```
## Holiday Calendar
This plugin displays notes based on the 'holiday' frontmatter element with a configurable number of days to look ahead and a number of built in calculations for the liturgical calendar and a few other moving holidays. For my full write up, see the [Holiday Calendar plugin page](holidayplugin). 

Repo here: [UndefeatedOrca/quartz-holiday-calendar](https://github.com/UndefeatedOrca/quartz-holiday-calendar) 

Install with:

```shell
npx quartz plugin add github:UndefeatedOrca/quartz-holiday-calendar
```
To appear only on the front page, the plugin uses a custom condition registered in quartz.ts and added to the plugin's format section of quartz.config.yaml.
# Discontinued Modifications
## poem-frontmatter.cjs
This can still be found in the v4 branch of the repo. It is no longer used, and I only put it there because I had no idea where else to put it.

This is a small script that Claude wrote to import the multitude of poems. I'm not sure that it was a total improvement, but it finds files in the `./content` folder with the name format "YY-MM-DD - title" and adds or edits frontmatter so that the date created reflects the date in the file name, the title the date except the day of the month, and any tags at the end of the body are inserted into the frontmatter. I'm still conflicted about the choice to include the day, and need to do further testing to see if order is based on title or file name.
## Clickable Images
After installing the lightbox image plugin from here: [vazome/quartz-clickable-images-zoom-plugin: Enabled Lightbox zoom for Quartz built websites](https://github.com/vazome/quartz-clickable-images-zoom-plugin), I discovered that it didn't work, so I threw the code into Claude and it spit out something that functions. Whether the initial break was a matter of user error or a problem with the code remains a mystery.

The transition to Quartz 5 has left me without a functional replacement for this plugin.

[^1]: They implemented a bouncing screensaver, they've gotta be legit

[^2]: I will give a prize to anyone who writes a compelling short story in which this is a coherent and important plot event
