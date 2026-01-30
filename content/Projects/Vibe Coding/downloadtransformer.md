---
title: Direct Downloads Quartz Plugin
draft: false
tags:
  - tech/vibecoding
  - tech/quartz
description:
created: 2026-01-26
modified:
holiday:
---
I wanted to add downloadable non-markdown, non-pdf files, to this website (even if hosting elsewhere is definitely ideal for larger projects and this isn't best practice to put stuff in the github repo).

Behold, a very short vibe-coded plugin to make links direct downloads when they aren't images, pdfs, or markdown.

(Installation is as usual - add to the transformers folder, export from the index, add to quartz.config.ts)

NOTE: while Obsidian doesn't care about case when making links, quartz does, be careful when writing those markdown links.

``` ts
import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"

export const DirectDownload: QuartzTransformerPlugin = () => {
  return {
    name: "DirectDownload",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, _file) => {
            visit(tree, "link", (node) => {
              const url = node.url
              
              // Skip external links, anchors, and relative parent paths
              if (!url || url.startsWith("http") || url.startsWith("#") || url.startsWith("..")) {
                return
              }

              const extension = url.split('.').pop()?.toLowerCase()
              
              // Skip markdown and PDF files
              if (extension === 'md' || extension === 'pdf') {
                return
              }

              // Skip image files that should embed normally
              const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico']
              if (extension && imageExtensions.includes(extension)) {
                return
              }

              // Add download attribute for all other files
              if (extension && extension.length <= 5) {
                node.data = node.data || {}
                node.data.hProperties = node.data.hProperties || {}
                node.data.hProperties.download = ""
              }
            })
          }
        },
      ]
    },
  }
}
```