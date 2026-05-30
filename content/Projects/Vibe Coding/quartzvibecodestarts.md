---
title: Vibe Coded Quartz Ideas -- Not implemented yet
draft: false
tags:
  - tech/vibecoding
description:
created: 2026-04-04
modified:
holiday:
---
This is where I'm putting my vibe-coding projects that I haven't implemented yet. I really need to figure out the basics of git so that I can just fork my repository and then have the AI coding assistant work in the fork and only push when I'm happy with the function.
# Popovers
## Popovers prompt
>[!warning] It turns out that Wikipedia is stingier with their API calls than you might expect, so this didn't work when I threw it in Codex:

You are building a custom plugin for Quartz (a static site generator) that adds hover-triggered popup previews to links. Do not make assumptions about the internal architecture or plugin system — ask me which version of Quartz I'm using before writing any code, and structure your implementation accordingly.

---

**Feature overview**

When a user hovers over a supported link, a popup appears showing a preview of the linked content. Popups can contain links that themselves trigger popups, enabling unlimited recursive nesting. Popups can be pinned in place and multiple pinned popups cascade visually.

---

**Supported link types**

- **Internal links**: links to other pages within the same Quartz site
- **Wikipedia links**: any link to wikipedia.org

For internal links, fetch the page and extract the title and main body content.

For Wikipedia links, fetch the full page and extract the intro section. If the link includes an anchor (e.g. `/wiki/Epistemology#Justified_true_belief`), extract the content under that specific heading instead of the intro.

No other external domains need to be supported initially, but the implementation should make it straightforward to add new sources later.

---

**Popup behavior**

- Popup triggers after a 300ms hover delay (debounced — reset if user stops hovering before delay completes)
- Popup appears near the hovered link, positioned smartly to avoid viewport edges
- Popup width scales with content between a minimum of 300px and maximum of 600px
- Popup contains a title bar and scrollable content area
- Links inside popup content are fully interactive and trigger their own popups on hover
- Recursion is unlimited and can cross sources (e.g. internal → Wikipedia → internal)
- On mobile/touch devices, the feature is disabled entirely

---

**Pinning and dismissal**

- Clicking a link pins its popup in place (sticky)
- Pinned popups have a visible close (✕) button and a pin indicator (📌)
- Unpinned popups dismiss when the user stops hovering
- Pinned popups dismiss when the user clicks ✕ or clicks outside the popup
- Unpinned child popups close when their parent closes
- Pinned popups are independent of their parent's state

**Cascade layout for pinned popups**

Each new pinned popup is offset 20px right and 20px down from the previously pinned popup, creating a visible cascade. Pinned popups are not draggable.

---

**Content extraction rules**

- Internal pages: extract the `<h1>` title and the main article body element; ignore frontmatter, tags, and metadata
- Wikipedia: fetch full page HTML and parse the DOM; do not use the summary API as it doesn't support anchor links; strip images, only show text

---

**What to ask me before writing code**

1. Which version of Quartz am I using?
2. Are there any constraints on external fetch requests I should be aware of (e.g. CSP headers, proxy requirements)?

Then implement based on my answers. Ask any other clarifying questions you need before starting.
#unfinished 
## Popovers simple
I asked Codex for just recursive internal links and I got this:
>[!warning] This does what it is supposed to, but 
>(1) the pin behavior only works if you don't hover over a window underneath the pinned window -- that breaks it; 
>(2) the windows are static and the pin button is ugly; and 
>(3) I'm not 100% sure that this actually is based on the original code for the popovers, my Codex workflow needs work, and I had to restore it by pasting in from my real quartz instance
### quartz/components/scripts/popover.inline.ts

```ts
import { computePosition, flip, inline, shift } from "@floating-ui/dom"
import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

const p = new DOMParser()
const hoverCloseDelay = 150
const contentCache = new Map<string, Promise<CachedPopoverContent | null>>()
const popovers = new Map<string, PopoverInstance>()
let popoverCounter = 0

type HoverPosition = {
  clientX: number
  clientY: number
}

type CachedPopoverContent = {
  contentType: string
  kind: "html" | "image" | "pdf" | "unsupported"
  html?: string
  url: string
}

type PopoverInstance = {
  id: string
  element: HTMLDivElement
  inner: HTMLDivElement
  content: HTMLDivElement
  sourceLink: HTMLAnchorElement
  parentId: string | null
  children: Set<string>
  pinned: boolean
  closeTimer: number | null
  hoverPosition: HoverPosition
}

function popoverId() {
  popoverCounter += 1
  return `popover-instance-${popoverCounter}`
}

function clearCloseTimer(instance: PopoverInstance) {
  if (instance.closeTimer !== null) {
    window.clearTimeout(instance.closeTimer)
    instance.closeTimer = null
  }
}

function getAncestorChain(startId: string | null) {
  const chain: PopoverInstance[] = []
  let currentId = startId

  while (currentId) {
    const instance = popovers.get(currentId)
    if (!instance) break
    chain.push(instance)
    currentId = instance.parentId
  }

  return chain
}

function cancelCloseChain(startId: string | null) {
  getAncestorChain(startId).forEach(clearCloseTimer)
}

function prefixPopoverIds(root: ParentNode, prefix: string) {
  root.querySelectorAll("[id]").forEach((elt) => {
    elt.id = `${prefix}-internal-${elt.id}`
  })
}

function scrollToHash(instance: PopoverInstance, hash: string) {
  if (hash === "") return
  const targetId = `${instance.id}-internal-${hash.slice(1)}`
  const heading = instance.content.querySelector(`#${CSS.escape(targetId)}`) as HTMLElement | null
  if (!heading) return

  instance.content.scroll({ top: heading.offsetTop - 12, behavior: "instant" })
}

async function positionPopover(instance: PopoverInstance) {
  const { x, y } = await computePosition(instance.sourceLink, instance.element, {
    strategy: "fixed",
    middleware: [inline({ x: instance.hoverPosition.clientX, y: instance.hoverPosition.clientY }), shift(), flip()],
  })

  Object.assign(instance.element.style, {
    transform: `translate(${x.toFixed()}px, ${y.toFixed()}px)`,
  })
}

function showPopover(instance: PopoverInstance, hash = "") {
  instance.element.classList.add("active-popover")
  void positionPopover(instance)
  scrollToHash(instance, hash)
}

function togglePinned(instance: PopoverInstance, nextPinned: boolean) {
  instance.pinned = nextPinned
  instance.element.classList.toggle("is-pinned", nextPinned)

  const pinButton = instance.element.querySelector(".popover-pin") as HTMLButtonElement | null
  if (pinButton) {
    pinButton.ariaPressed = String(nextPinned)
    pinButton.textContent = nextPinned ? "Unpin" : "Pin"
  }

  if (nextPinned) {
    clearCloseTimer(instance)
  }
}

function closePopover(id: string) {
  const instance = popovers.get(id)
  if (!instance) return

  ;[...instance.children].forEach(closePopover)
  clearCloseTimer(instance)

  if (instance.parentId) {
    popovers.get(instance.parentId)?.children.delete(id)
  }

  instance.element.remove()
  popovers.delete(id)
}

function closeUnpinnedChildren(parentId: string | null) {
  const matching = [...popovers.values()].filter((instance) => instance.parentId === parentId && !instance.pinned)
  matching.forEach((instance) => closePopover(instance.id))
}

function scheduleClose(id: string) {
  const instance = popovers.get(id)
  if (!instance || instance.pinned) return

  clearCloseTimer(instance)
  instance.closeTimer = window.setTimeout(() => {
    const latest = popovers.get(id)
    if (!latest || latest.pinned) return
    closePopover(id)
  }, hoverCloseDelay)
}

function findOpenPopover(link: HTMLAnchorElement, parentId: string | null) {
  return [...popovers.values()].find(
    (instance) => instance.sourceLink === link && instance.parentId === parentId,
  )
}

function createControls(instance: PopoverInstance) {
  const controls = document.createElement("div")
  controls.classList.add("popover-controls")

  const pinButton = document.createElement("button")
  pinButton.classList.add("popover-pin")
  pinButton.type = "button"
  pinButton.textContent = "Pin"
  pinButton.ariaLabel = "Pin popover"
  pinButton.ariaPressed = "false"
  pinButton.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    togglePinned(instance, !instance.pinned)
  })

  const closeButton = document.createElement("button")
  closeButton.classList.add("popover-close")
  closeButton.type = "button"
  closeButton.textContent = "Close"
  closeButton.ariaLabel = "Close popover"
  closeButton.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    closePopover(instance.id)
  })

  controls.append(pinButton, closeButton)
  return controls
}

function bindLinkHover(root: Document | Element, parentId: string | null) {
  const links = [...root.querySelectorAll("a.internal")] as HTMLAnchorElement[]

  for (const link of links) {
    const mouseEnterHandler = (e: MouseEvent) => {
      void openPopover(link, parentId, { clientX: e.clientX, clientY: e.clientY })
    }

    const mouseLeaveHandler = () => {
      const existing = findOpenPopover(link, parentId)
      if (existing) {
        scheduleClose(existing.id)
      }
    }

    link.addEventListener("mouseenter", mouseEnterHandler)
    link.addEventListener("mouseleave", mouseLeaveHandler)
    window.addCleanup(() => {
      link.removeEventListener("mouseenter", mouseEnterHandler)
      link.removeEventListener("mouseleave", mouseLeaveHandler)
    })
  }
}

async function loadPopoverContent(targetUrl: URL) {
  const cacheKey = targetUrl.toString()
  if (!contentCache.has(cacheKey)) {
    contentCache.set(
      cacheKey,
      (async () => {
        const response = await fetchCanonical(targetUrl).catch((err) => {
          console.error(err)
          return null
        })

        if (!response) return null
        const contentType = response.headers.get("Content-Type") ?? "text/html"
        const [baseType] = contentType.split(";")
        const [category, subtype] = baseType.split("/")

        switch (category) {
          case "image":
            return { contentType: baseType, kind: "image", url: targetUrl.toString() } satisfies CachedPopoverContent
          case "application":
            if (subtype === "pdf") {
              return {
                contentType: baseType,
                kind: "pdf",
                url: targetUrl.toString(),
              } satisfies CachedPopoverContent
            }
            return { contentType: baseType, kind: "unsupported", url: targetUrl.toString() } satisfies CachedPopoverContent
          default: {
            const contents = await response.text()
            const html = p.parseFromString(contents, "text/html")
            normalizeRelativeURLs(html, targetUrl)
            const elts = [...html.getElementsByClassName("popover-hint")]
            if (elts.length === 0) return null

            return {
              contentType: baseType,
              kind: "html",
              html: elts.map((elt) => elt.outerHTML).join(""),
              url: targetUrl.toString(),
            } satisfies CachedPopoverContent
          }
        }
      })(),
    )
  }

  return contentCache.get(cacheKey)!
}

function populatePopover(instance: PopoverInstance, cached: CachedPopoverContent) {
  instance.inner.dataset.contentType = cached.contentType
  instance.inner.appendChild(createControls(instance))
  instance.inner.appendChild(instance.content)

  switch (cached.kind) {
    case "image": {
      const img = document.createElement("img")
      img.src = cached.url
      img.alt = new URL(cached.url).pathname
      instance.content.appendChild(img)
      break
    }
    case "pdf": {
      const pdf = document.createElement("iframe")
      pdf.src = cached.url
      instance.content.appendChild(pdf)
      break
    }
    case "html": {
      instance.content.innerHTML = cached.html ?? ""
      prefixPopoverIds(instance.content, instance.id)
      bindLinkHover(instance.content, instance.id)
      break
    }
    case "unsupported":
      instance.content.textContent = "Preview unavailable."
      break
  }
}

async function openPopover(
  link: HTMLAnchorElement,
  parentId: string | null,
  hoverPosition: HoverPosition,
) {
  if (link.dataset.noPopover === "true") {
    return
  }

  if (parentId === null) {
    closeUnpinnedChildren(null)
  } else {
    closeUnpinnedChildren(parentId)
    cancelCloseChain(parentId)
  }

  const targetUrl = new URL(link.href)
  const hash = decodeURIComponent(targetUrl.hash)
  targetUrl.hash = ""
  targetUrl.search = ""

  const existing = findOpenPopover(link, parentId)
  if (existing) {
    existing.hoverPosition = hoverPosition
    cancelCloseChain(existing.id)
    showPopover(existing, hash)
    return
  }

  const cached = await loadPopoverContent(targetUrl)
  if (!cached) return

  const element = document.createElement("div")
  element.classList.add("popover", "active-popover")

  const inner = document.createElement("div")
  inner.classList.add("popover-inner")
  element.appendChild(inner)

  const content = document.createElement("div")
  content.classList.add("popover-content")

  const instance: PopoverInstance = {
    id: popoverId(),
    element,
    inner,
    content,
    sourceLink: link,
    parentId,
    children: new Set(),
    pinned: false,
    closeTimer: null,
    hoverPosition,
  }

  if (parentId) {
    popovers.get(parentId)?.children.add(instance.id)
  }

  populatePopover(instance, cached)
  element.dataset.popoverId = instance.id
  if (parentId) {
    element.dataset.parentPopoverId = parentId
  }

  element.addEventListener("mouseenter", () => cancelCloseChain(instance.id))
  element.addEventListener("mouseleave", () => scheduleClose(instance.id))

  document.body.appendChild(element)
  popovers.set(instance.id, instance)
  cancelCloseChain(instance.id)
  showPopover(instance, hash)
}

function closeAllPopovers() {
  ;[...popovers.keys()].forEach(closePopover)
}

document.addEventListener("nav", () => {
  closeAllPopovers()
  bindLinkHover(document, null)
})

```

### quartz/components/styles/popover.scss
```scss
@use "../../styles/variables.scss" as *;

@keyframes dropin {
  0% {
    opacity: 0;
    visibility: hidden;
  }
  1% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    visibility: visible;
  }
}

.popover {
  z-index: 999;
  position: fixed;
  overflow: visible;
  padding: 1rem;
  left: 0;
  top: 0;
  will-change: transform;

  & > .popover-inner {
    position: relative;
    width: 30rem;
    max-height: 20rem;
    font-weight: initial;
    font-style: initial;
    line-height: normal;
    font-size: initial;
    font-family: var(--bodyFont);
    border: 1px solid var(--lightgray);
    background-color: var(--light);
    border-radius: 5px;
    box-shadow: 6px 6px 36px 0 rgba(0, 0, 0, 0.25);
    white-space: normal;
    user-select: text;
    cursor: default;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .popover-controls {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.75rem 0.75rem 0 0.75rem;

    button {
      border: 1px solid var(--lightgray);
      background: var(--light);
      color: var(--dark);
      border-radius: 999px;
      padding: 0.2rem 0.6rem;
      font-size: 0.75rem;
      line-height: 1.2;
      cursor: pointer;
    }
  }

  .popover-content {
    padding: 0 1rem 1rem 1rem;
    max-height: 20rem;
    overflow: auto;
    overscroll-behavior: contain;
  }

  & > .popover-inner[data-content-type] {
    &[data-content-type*="pdf"],
    &[data-content-type*="image"] {
      max-height: 100%;
    }

    &[data-content-type*="image"] {
      .popover-content {
        padding: 0;
        max-height: none;
      }

      img {
        margin: 0;
        border-radius: 0;
        display: block;
      }
    }

    &[data-content-type*="pdf"] {
      .popover-content {
        padding: 0;
        max-height: 70vh;
      }

      iframe {
        width: 100%;
        min-height: 70vh;
      }
    }
  }

  h1 {
    font-size: 1.5rem;
  }

  visibility: hidden;
  opacity: 0;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;

  @media all and ($mobile) {
    display: none !important;
  }
}

.active-popover,
.popover:hover {
  animation: dropin 0.3s ease;
  animation-fill-mode: forwards;
  animation-delay: 0.2s;
}

.popover.is-pinned > .popover-inner {
  border-color: var(--secondary);
  box-shadow: 0 0 0 1px var(--secondary), 6px 6px 36px 0 rgba(0, 0, 0, 0.25);
}
```
# Beeline
Pretty basic implementation of the beeline reader feature for the site -- colors are ugly, static, and not tied to the theme, link handling is bizarre, and the gradient mixing is super wonky (maybe it should use the accent color and fade it in to 50% and then back to 0%, needs checking). Even so, it broadly functions.
>[!info] Must be exported to index.ts and added to quartz.layout.ts
### quartz\components\BeelineReader.tsx
```tsx
// @ts-ignore
import beelineReaderScript from "./scripts/beeline.inline"
import styles from "./styles/beelineReader.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const enableLabel = "Enable BeeLine reader"

const BeelineReader: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <button
      class={classNames(displayClass, "beeline-reader")}
      type="button"
      aria-label={enableLabel}
      aria-pressed="false"
      title={enableLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="beelineIcon"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M4 6.5h16" />
        <path d="M4 10.5h8" />
        <path d="M4 14.5h16" />
        <path d="M4 18.5h8" />
        <path d="M15.5 9.5h4a1 1 0 0 1 1 1v4a3.5 3.5 0 0 1-3.5 3.5h-1.5z" />
      </svg>
    </button>
  )
}

BeelineReader.beforeDOMLoaded = beelineReaderScript
BeelineReader.css = styles

export default (() => BeelineReader) satisfies QuartzComponentConstructor

```

### quartz\components\scripts\beeline.inline.ts
```ts
const STORAGE_KEY = "beeline-reader"
const ROOT_ATTRIBUTE = "data-beeline-reader"
const ARTICLE_SELECTOR = ".center article"
const BLOCK_SELECTOR = "p, li, blockquote, td, th, dd, dt"
const BUTTON_SELECTOR = ".beeline-reader"
const ENABLE_LABEL = "Enable BeeLine reader"
const DISABLE_LABEL = "Disable BeeLine reader"
const LIGHT_MODE_START_COLOR = "#c62828"
const LIGHT_MODE_END_COLOR = "#1565c0"
const DARK_MODE_START_COLOR = "#ff8a80"
const DARK_MODE_END_COLOR = "#82b1ff"
const LIGHT_MODE_GUIDE_STRENGTH = 42
const DARK_MODE_GUIDE_STRENGTH = 38
const WORD_REGEX = /([\p{L}\p{N}][\p{L}\p{N}'_-]*)/gu
const SKIP_SELECTOR =
  "code, pre, script, style, textarea, svg, math, mjx-container, .katex, .mermaid"

let isBeelineMode = localStorage.getItem(STORAGE_KEY) === "on"
let resizeFrame = 0

function createToken(word: string) {
  const token = document.createElement("span")
  token.className = "beeline-token"
  token.dataset.beelineToken = "true"
  token.textContent = word
  return token
}

function transformTextNode(node: Text) {
  const text = node.textContent ?? ""
  WORD_REGEX.lastIndex = 0

  let match: RegExpExecArray | null
  let lastIndex = 0
  let changed = false
  const fragment = document.createDocumentFragment()

  while ((match = WORD_REGEX.exec(text)) !== null) {
    changed = true
    const [word] = match
    const start = match.index

    if (start > lastIndex) {
      fragment.append(text.slice(lastIndex, start))
    }

    fragment.appendChild(createToken(word))
    lastIndex = start + word.length
  }

  if (!changed) {
    return null
  }

  if (lastIndex < text.length) {
    fragment.append(text.slice(lastIndex))
  }

  return fragment
}

function shouldProcessTextNode(node: Text) {
  if (!node.textContent?.trim()) return false

  const parent = node.parentElement
  if (!parent) return false
  if (parent.closest(SKIP_SELECTOR)) return false
  if (parent.closest(".beeline-token")) return false

  return true
}

function tokenizeContainer(container: HTMLElement) {
  if (container.dataset.beelineProcessed === "true") return

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  let currentNode = walker.nextNode()
  while (currentNode) {
    if (currentNode instanceof Text && shouldProcessTextNode(currentNode)) {
      textNodes.push(currentNode)
    }

    currentNode = walker.nextNode()
  }

  for (const textNode of textNodes) {
    const fragment = transformTextNode(textNode)
    if (!fragment) continue
    textNode.replaceWith(fragment)
  }

  container.dataset.beelineProcessed = "true"
}

function tokenizeArticles() {
  for (const article of document.querySelectorAll<HTMLElement>(ARTICLE_SELECTOR)) {
    for (const block of article.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)) {
      tokenizeContainer(block)
    }
  }
}

function syncButtonState() {
  const label = isBeelineMode ? DISABLE_LABEL : ENABLE_LABEL

  for (const button of document.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR)) {
    button.setAttribute("aria-pressed", isBeelineMode ? "true" : "false")
    button.setAttribute("aria-label", label)
    button.setAttribute("title", label)
  }
}

function getGuideColors() {
  const isDarkMode = document.documentElement.getAttribute("saved-theme") === "dark"

  return isDarkMode
    ? {
        start: DARK_MODE_START_COLOR,
        end: DARK_MODE_END_COLOR,
        strength: DARK_MODE_GUIDE_STRENGTH,
      }
    : {
        start: LIGHT_MODE_START_COLOR,
        end: LIGHT_MODE_END_COLOR,
        strength: LIGHT_MODE_GUIDE_STRENGTH,
      }
}

function paintContainer(container: HTMLElement) {
  const tokens = [...container.querySelectorAll<HTMLElement>(".beeline-token")]
  if (tokens.length === 0) return
  const { start, end, strength } = getGuideColors()

  const lines: HTMLElement[][] = []
  let currentLine: HTMLElement[] = []
  let previousTop: number | null = null

  for (const token of tokens) {
    const top = Math.round(token.getBoundingClientRect().top)

    if (previousTop === null || Math.abs(top - previousTop) <= 2) {
      currentLine.push(token)
    } else {
      lines.push(currentLine)
      currentLine = [token]
    }

    previousTop = top
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  for (const [lineIndex, line] of lines.entries()) {
    const lineLength = line.length

    for (const [tokenIndex, token] of line.entries()) {
      const progress = lineLength <= 1 ? 0.5 : tokenIndex / (lineLength - 1)
      const direction = lineIndex % 2 === 0 ? progress : 1 - progress
      token.style.setProperty(
        "--beeline-token-color",
        `color-mix(in srgb, var(--darkgray) ${100 - strength}%, color-mix(in srgb, ${start} ${Math.round((1 - direction) * 100)}%, ${end} ${Math.round(direction * 100)}%) ${strength}%)`,
      )
      token.dataset.beelineLine = lineIndex % 2 === 0 ? "even" : "odd"
    }
  }
}

function paintArticles() {
  for (const article of document.querySelectorAll<HTMLElement>(ARTICLE_SELECTOR)) {
    for (const block of article.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)) {
      paintContainer(block)
    }
  }
}

function schedulePaint() {
  if (!isBeelineMode) return

  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    paintArticles()
  })
}

function applyBeelineState() {
  document.documentElement.setAttribute(ROOT_ATTRIBUTE, isBeelineMode ? "on" : "off")

  if (isBeelineMode) {
    tokenizeArticles()
    schedulePaint()
  }

  syncButtonState()
}

document.addEventListener("nav", () => {
  const toggleBeelineMode = () => {
    isBeelineMode = !isBeelineMode
    localStorage.setItem(STORAGE_KEY, isBeelineMode ? "on" : "off")
    applyBeelineState()
  }

  const handleResize = () => {
    schedulePaint()
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR)) {
    button.addEventListener("click", toggleBeelineMode)
    window.addCleanup(() => button.removeEventListener("click", toggleBeelineMode))
  }

  window.addEventListener("resize", handleResize)
  window.addCleanup(() => window.removeEventListener("resize", handleResize))

  document.addEventListener("readermodechange", handleResize)
  window.addCleanup(() => document.removeEventListener("readermodechange", handleResize))

  applyBeelineState()
})

```

### quartz\components\styles\beelineReader.scss
```scss
.beeline-reader {
  cursor: pointer;
  padding: 0;
  position: relative;
  background: none;
  border: none;
  width: 20px;
  height: 20px;
  margin: 0;
  text-align: inherit;
  flex-shrink: 0;

  & svg {
    position: absolute;
    width: 20px;
    height: 20px;
    top: calc(50% - 10px);
    stroke: var(--darkgray);
    transition:
      stroke 0.15s ease,
      opacity 0.15s ease;
  }

  &[aria-pressed="true"] svg {
    stroke: var(--secondary);
  }
}

:root[data-beeline-reader="on"] {
  .center article {
    .beeline-token {
      color: var(--beeline-token-color, var(--darkgray));
      transition: color 0.15s ease;
    }
  }
}

```