---
title: Textbook Copy Paste Enabler
draft: false
tags:
  - tech/vibecoding
  - school
description:
created: 2026-01-26
modified:
holiday:
---
The online textbooks that my School of Business uses are really annoying because they don't let you copy-paste. I realized that this was a fixable problem. Behold: [The textbook copy-inator](TextbookCopy.crx)!
![[Pasted image 20260130082434.png]]

This extension suppresses whatever nonsense they have to prevent you from copying quotes into essays and the annotation box as well. To turn it on for a page just click the icon extension when you want to use it and it'll strip the problematic elements.

It's a bit touchy, but it works!
# Content
## Code
### background.js

```js
chrome.action.onClicked.addListener((tab) => {

  chrome.scripting.executeScript({

    target: { tabId: tab.id },

    func: enableCopy

  });

});

  

function enableCopy() {

  // Function to aggressively enable copy on a document

  function enableCopyOnDoc(doc, win) {

    if (!doc || !doc.body) return;

    console.log('Enabling copy on document');

    // Remove annotation overlay and prevent it from showing

    function removeAnnotationOverlay() {

      // Remove the annotation context menu

      const overlays = doc.querySelectorAll('rdrx-annotations-context-menu, .cdk-overlay-container, .cdk-overlay-backdrop, .annotations-overlay-panel');

      overlays.forEach(el => {

        el.style.display = 'none';

        el.style.visibility = 'hidden';

        el.style.pointerEvents = 'none';

        el.remove();

      });

      // Also check in shadow DOM if present

      doc.querySelectorAll('*').forEach(el => {

        if (el.shadowRoot) {

          const shadowOverlays = el.shadowRoot.querySelectorAll('rdrx-annotations-context-menu, .cdk-overlay-container, .cdk-overlay-backdrop');

          shadowOverlays.forEach(overlay => {

            overlay.style.display = 'none';

            overlay.remove();

          });

        }

      });

    }

    // Initial removal

    removeAnnotationOverlay();

    // Add CSS to permanently hide annotation overlays

    const style = doc.createElement('style');

    style.id = 'copy-enabler-style';

    style.textContent = `

      /* Hide annotation overlays */

      rdrx-annotations-context-menu,

      .cdk-overlay-container,

      .cdk-overlay-backdrop,

      .annotations-overlay-panel,

      .annotation-context-menu-backdrop {

        display: none !important;

        visibility: hidden !important;

        pointer-events: none !important;

        opacity: 0 !important;

      }

      /* Enable text selection */

      * {

        user-select: text !important;

        -webkit-user-select: text !important;

        -moz-user-select: text !important;

        -ms-user-select: text !important;

        -webkit-touch-callout: default !important;

      }

      ::selection {

        background: #b3d4fc !important;

        color: #000 !important;

      }

      ::-moz-selection {

        background: #b3d4fc !important;

        color: #000 !important;

      }

      /* Ensure context menu works */

      body {

        pointer-events: auto !important;

      }

    `;

    if (doc.head) {

      doc.head.appendChild(style);

    }

    // Override execCommand to ensure clipboard access

    const originalExecCommand = doc.execCommand.bind(doc);

    doc.execCommand = function(command, showUI, value) {

      if (command === 'copy') {

        try {

          const selection = doc.getSelection();

          if (selection && selection.toString()) {

            navigator.clipboard.writeText(selection.toString()).then(() => {

              console.log('Copied:', selection.toString().substring(0, 50));

            }).catch(err => {

              return originalExecCommand(command, showUI, value);

            });

            return true;

          }

        } catch (e) {

          console.log('Error in copy override:', e);

        }

      }

      return originalExecCommand(command, showUI, value);

    };

    // Force enable clipboard events

    doc.addEventListener('copy', function(e) {

      const selection = doc.getSelection();

      if (selection && selection.toString()) {

        e.clipboardData?.setData('text/plain', selection.toString());

        console.log('Copy event intercepted');

      }

      e.stopPropagation();

    }, true);

    // Block all event prevention

    const blockableEvents = ['copy', 'cut', 'contextmenu', 'selectstart', 'select',

                            'mousedown', 'mouseup', 'keydown', 'keyup', 'click'];

    blockableEvents.forEach(eventType => {

      doc.addEventListener(eventType, function(e) {

        // Remove overlay on any interaction

        removeAnnotationOverlay();

        if (eventType === 'contextmenu') {

          e.stopPropagation();

          e.stopImmediatePropagation();

          return true;

        }

        if (['copy', 'cut'].includes(eventType)) {

          e.stopPropagation();

          e.stopImmediatePropagation();

        }

      }, true);

      doc.body['on' + eventType] = null;

      doc['on' + eventType] = null;

    });

    // Remove all inline event attributes

    const removeEventAttrs = () => {

      doc.querySelectorAll('*').forEach(el => {

        ['oncopy', 'oncut', 'oncontextmenu', 'onselectstart', 'onselect',

         'onmousedown', 'onmouseup', 'onclick', 'ondblclick'].forEach(attr => {

          if (el.hasAttribute(attr)) {

            el.removeAttribute(attr);

          }

          el[attr] = null;

        });

      });

    };

    removeEventAttrs();

    // Override Event.prototype methods

    const EventProto = win?.Event?.prototype || Event.prototype;

    const originalPreventDefault = EventProto.preventDefault;

    const originalStopPropagation = EventProto.stopPropagation;

    const originalStopImmediatePropagation = EventProto.stopImmediatePropagation;

    EventProto.preventDefault = function() {

      if (['copy', 'cut', 'contextmenu', 'selectstart'].includes(this.type)) {

        console.log('Blocked preventDefault on', this.type);

        return;

      }

      return originalPreventDefault.call(this);

    };

    EventProto.stopPropagation = function() {

      if (['copy', 'cut', 'contextmenu'].includes(this.type)) {

        console.log('Blocked stopPropagation on', this.type);

        return;

      }

      return originalStopPropagation.call(this);

    };

    EventProto.stopImmediatePropagation = function() {

      if (['copy', 'cut', 'contextmenu'].includes(this.type)) {

        console.log('Blocked stopImmediatePropagation on', this.type);

        return;

      }

      return originalStopImmediatePropagation.call(this);

    };

    // Watch for overlay being added back and remove it

    const observer = new MutationObserver((mutations) => {

      removeEventAttrs();

      removeAnnotationOverlay();

    });

    observer.observe(doc.body, {

      attributes: true,

      childList: true,

      subtree: true

    });

    // Add custom copy keyboard shortcut as backup

    doc.addEventListener('keydown', function(e) {

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {

        const selection = doc.getSelection();

        if (selection && selection.toString()) {

          navigator.clipboard.writeText(selection.toString()).then(() => {

            console.log('Manual copy successful');

          }).catch(err => {

            console.log('Manual copy failed:', err);

          });

        }

      }

    }, true);

  }

  // Enable on main document

  enableCopyOnDoc(document, window);

  // Process all iframes

  function processIframes() {

    const iframes = document.querySelectorAll('iframe');

    let processed = 0;

    iframes.forEach(iframe => {

      try {

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

        const iframeWin = iframe.contentWindow;

        if (iframeDoc && iframeWin) {

          enableCopyOnDoc(iframeDoc, iframeWin);

          processed++;

        }

      } catch (e) {

        console.log('Skipped iframe:', e.message);

      }

    });

    return processed;

  }

  // Initial processing with delay

  setTimeout(() => {

    const count = processIframes();

    console.log(`Processed ${count} iframes`);

  }, 100);

  // Keep watching for new iframes

  const mainObserver = new MutationObserver(() => {

    processIframes();

  });

  mainObserver.observe(document.body, {

    childList: true,

    subtree: true

  });

  // Aggressive periodic reprocessing

  setInterval(() => {

    processIframes();

  }, 2000);

  // Add manual trigger

  document.addEventListener('keydown', function(e) {

    if (e.ctrlKey && e.shiftKey && e.key === 'C') {

      const count = processIframes();

      alert(`Copy protection re-applied to ${count} iframe(s)!\nAnnotation overlay removed.`);

    }

  });

  alert('✓ Copy protection disabled!\n✓ Annotation overlay hidden!\n✓ Right-click menu enabled!\n\nPress Ctrl+Shift+C to re-apply if needed.');

}
```
### manifest.json
```json
{

  "manifest_version": 3,

  "name": "Copy Enabler",

  "version": "1.4",

  "description": "Enables copy-paste on protected pages",

  "permissions": ["scripting", "activeTab"],

  "action": {

    "default_title": "Enable Copy"

  },

  "background": {

    "service_worker": "background.js"

  },

  "icons": {

    "16": "icon16.png",

    "48": "icon48.png",

    "128": "icon128.png"

  }

}
```
## icons
### icon16.png
![[Pasted image 20260130083403.png]]
### icon48.png
![[Pasted image 20260130083410.png]]
### icon128.png
![[Pasted image 20260130083414.png]]