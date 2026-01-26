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