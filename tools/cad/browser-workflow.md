# Browser acquisition recipe

Use the supported browser tools in an authenticated institutional session. This is a sequential UI workflow, not an EBSCO API client. Read the browser capability documentation before running. Keep signed PDF URLs out of logs and files.

1. Start `collector.py` locally.
2. Read the JSON displayed by `http://127.0.0.1:8766/queue` using browser DOM inspection.
3. For each item, navigate to its saved detail URL and verify the displayed title.
4. Click its **Access now (PDF)** button. Wait until the PDF page region appears. If the page is still loading, inspect the current state before retrying. If authentication or restrictions appear, stop that source.
5. Call the tab's `pageAssets.list()` capability. Select the asset already loaded from `https://content.ebscohost.com/cds/retrieve?...`. Do not navigate to asset URLs or call unsupported PDF bundling.
6. On the local `/download` form, fill the **PDF transfer** textbox with JSON containing the queue ID and observed asset URL, then click **Save PDF**.
7. Read only the resulting body text (not the populated textbox, which contains the temporary URL). Continue on `Imported`; retain `Staged for review` for an actual PDF check. Stop on source restrictions or unexpected results.
8. Refresh `/queue` between batches. The manifest, not browser variables or success toasts, determines what remains.
9. Stop the collector when finished. No recurring task or deployment is configured.

Example using supported tab handles after their documentation is loaded:

```javascript
await articleTab.goto(item.url);
await articleTab.playwright.getByRole('button', {name: /Access now \(PDF\)/}).click();
// Inspect the rendered state and wait for the page region before collecting assets.
const state = await articleTab.playwright.domSnapshot();
const inventory = await (await articleTab.capabilities.get('pageAssets')).list();
const asset = inventory.assets.find(a => a.url.startsWith('https://content.ebscohost.com/cds/retrieve?'));
if (!asset) throw new Error('Authorized PDF has not loaded');
await intakeTab.goto('http://127.0.0.1:8766/download');
await intakeTab.playwright.getByRole('textbox', {name: 'PDF transfer'}).fill(JSON.stringify({id: item.id, url: asset.url}));
await intakeTab.playwright.getByRole('button', {name: 'Save PDF'}).click();
const result = await intakeTab.playwright.locator('body').innerText();
```
