---
title: The Design and Customization of this Site
draft: false
tags:
  - tech/quartz
description:
created: 2025-12-23
modified: 2025-12-27
---
I've used most of the Quartz defaults, but there are a few modifications that I've made with the help of Claude. 
All code is available at the [github repository](https://github.com/UndefeatedOrca/quartz).
# Custom Favicon
Using GIMP, I edited a picture of myself with glasses on the back of my head such that it looked like that was my head, and then a minor color modification of the blue glasses created the favicon that you see today.

Is it good? 

shhhhh
# poem-frontmatter.cjs
This is a small script that Claude wrote to import the multitude of poems. I'm not sure that it was a total improvement, but it finds files in the .`/content` folder with the name format "YY-MM-DD - title" and adds or edits frontmatter so that the date created reflects the date in the file name, the title the date except the day of the month, and any tags at the end of the body are inserted into the frontmatter. I'm still conflicted about the choice to include the day, and need to do further testing to see if order is based on title or file name.
# Parent and Child Tag Links
When you look at a tag page, at the top you'll see links to any parent or child tags. This is helpful for two reasons
1. You might want to read all of the nature poems but found one about snow first. Default Quartz requires you to manually edit your url to find the nested tag.
2. Sometimes I misspell tags and the only way to find the rest of tags is to look in the parent and verify that there's no strange modifications
This was achieved modifying `./quartz/quartz/components/pages/TagContent.tsx`, thanks Claude!
# Holiday Calendar
![[holidayplugin#Summary]]
# Analytics
I opted to use PostHog analytics for the site, for three reasons:

1. It's free for any realistic usage I might have
2. It looked better than [GoatCounter]([GoatCounter – open source web analytics](https://www.goatcounter.com/))
3. The design of their [website](https://posthog.com/) was really cool and suggested that the company was fun[^1]

I, technical imbecile that I am, have no idea what most of the stuff on my dashboard does in any way. What I do know is that implementing it was more difficult than I would have liked. As I learn how the dashboard works, I'll update this section.

To learn how to implement cookie free PostHog analytics for your Quartz installation, go here: [How to Set Up Cookie Free PostHog Analytics](nocookieposthog.md)
# Clickable Images
After installing the lightbox image plugin from here: [vazome/quartz-clickable-images-zoom-plugin: Enabled Lightbox zoom for Quartz built websites](https://github.com/vazome/quartz-clickable-images-zoom-plugin), I discovered that it didn't work, so I threw the code into Claude and it spit out something that functions. Whether the initial break was a matter of user error or a problem with the code remains a mystery.
# File Direct Downloads
[Vibe-coded plugin](downloadtransformer) to make links direct downloads when they aren't images, pdfs, or markdown.

[^1]: They implemented a bouncing screensaver, they've gotta be legit
