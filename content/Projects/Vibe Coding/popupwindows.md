---
title:
draft: false
tags:
description:
created: 2026-03-14
modified:
holiday:
---
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