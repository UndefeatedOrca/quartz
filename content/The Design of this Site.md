---
title:
draft: false
tags:
description:
created: 2025-12-23
modified:
---
I've used most of the Quartz defaults, but there are a few modifications that I've made with the help of Claude. 
All code is available at the [github repository]([UndefeatedOrca/quartz: This is my repository for my quartz website](https://github.com/UndefeatedOrca/quartz)).
# Custom Favicon
Using GIMP, I edited a picture of myself with glasses on the back of my head such that it looked like that was my head, and then a minor color modification of the blue glasses created the favicon that you see today.

Is it good? 

shhhhh
# convert-frontmatter.cjs
This is a small script that Claude wrote to import the multitude of poems. I'm not sure that it was a total improvement, but it finds files in the /content folder with the name format "YY-MM-DD - title" and adds frontmatter so that the date created reflects the date in the file name and the title strips everything except the day of the month (for ordering purposes). Whether that was an aesthetic improvement depends greatly on whether you're looking at a search result or the tag hierarchy, but I think it's net positive overall.

If I knew more about any of this, I could probably configure my daily note so that continued use of this script was unnecessary, but as it is, I'll need to run it occasionally to modify existing notes.
# Parent and Child Tag Pages
When you look at a tag page, at the top you'll see links to any parent or child tags. This is helpful for two reasons
1. You might want to read all of the nature poems but found one about snow first. Default Quartz requires you to manually edit your url to find the nested tag.
2. Sometimes I misspell tags and the only way to find the rest of tags is to look in the parent and verify that there's no strange modifications
This was achieved modifying quartz\quartz\components\pages\TagContent.tsx.
# Hide Attachments Folder from Explorer
This is a little filter built into quartz.layout.ts by Claude which hides the attachments folder from the explorer view. I'm 80% sure it works and is necessary.
```
Component.Explorer({
      filterFn: (node) => {
        const hiddenFolders = new Set(["attachments"])
        return !hiddenFolders.has(node.displayName)
      }
    })
```