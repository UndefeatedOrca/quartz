# CAD archive utility

Python 3 with `pypdf`; tests also use `reportlab`. Run from the repository root. State and bibliographic evidence live in `tools/cad/data`; temporary source PDFs live in ignored `private/cad` (outside published content). Existing PDF URLs are never renamed.

```powershell
$cadPython = 'C:/Users/patri/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
& $cadPython tools/cad/archive.py inventory
& $cadPython tools/cad/archive.py reconcile --file tools/cad/data/ebsco-records.json
& $cadPython tools/cad/archive.py import --id ebsco:ACCESSION --file path/to/article.pdf
& $cadPython tools/cad/archive.py sync-downloads --file C:/Users/patri/Downloads
& $cadPython tools/cad/archive.py render --volumes 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38
& $cadPython tools/cad/archive.py validate --links
& $cadPython tools/cad/archive.py report
& $cadPython -m unittest discover -s tools/cad -p 'test_*.py'
node ./quartz/bootstrap-cli.mjs build
```

## Authenticated acquisition

Start `tools/cad/collector.py` and use the existing institutional browser session. The collector binds only `127.0.0.1:8766`:

- `/queue`: current EBSCO records without a local PDF, derived from the manifest.
- `/`: paste public bibliography JSON from rendered result pages; stable links only.
- `/download`: paste `{ "id": "manifest-or-source-id", "url": "observed PDF asset URL" }`. Obtain that exact asset from the authorized EBSCO viewer after using its Access now (PDF) control. Never construct or guess signed URLs. Use the browser automation script in `browser-workflow.md`.

The collector keeps temporary URLs in memory only. It stages to `.part`, validates the file, atomically promotes it, then imports and persists the manifest. An interrupted transfer starts again from the affected file, with up to three retries (1, 2, 4 seconds). HTTP 401, 403 or 429 pauses the source persistently in `acquisition-state.json`; restore browser access, then explicitly restart with `--resume-source`. Do not loop through access restrictions. Already-imported files are checksum-checked and skipped before any network request.

The browser's download success message alone is insufficient. Confirm an `Imported` result and the manifest's local path/checksum. Unsupported browser PDF bundle/export APIs are unnecessary.

## Identity exceptions and full issues

Automatic matching uses stable source IDs or volume, normalized title, authors and page ranges. Ambiguous records are reported. PDF import checks opening-page text; generic short titles also require an author surname match. Scans and source-title discrepancies go to review.

After actually inspecting a staged PDF, record a checksum-bound review:

```powershell
& $cadPython tools/cad/archive.py review --id RECORD_ID --file private/cad/RECORD_ID.pdf --evidence 'Verified title, author and printed pages; explain the source discrepancy.'
& $cadPython tools/cad/archive.py import --id RECORD_ID --file private/cad/RECORD_ID.pdf
```

For extraction, a record must have an `extraction` object containing `parent_path`, `parent_sha256`, one-based `pdf_start` / `pdf_end`, `printed_pages`, and nonempty `evidence`. Run `extract --id RECORD_ID`. The parent remains unchanged. Never infer PDF offsets from printed pages without checking the contents and boundaries.

## Table capitalization

Index tables use **sentence case**: capitalize the opening word, the subtitle after a colon, proper names, and acronyms. This keeps long scholarly titles readable alongside the older archive entries. All-caps typography from EBSCO is retained in source metadata.

`data/display-titles.json` contains reviewed display labels keyed by stable manifest ID. Rendering uses these labels without changing matching titles, original bibliography, PDF bytes, filenames or URLs. `prepare_display_titles.py` prepares labels using a collection-specific proper-name vocabulary; review its output when adding new material. It is not a general proper-name detector.

## Coverage

`coverage.md` separates already-present, acquired, missing and full-issue-only contents. `source-reconciliation.md` explains what has and has not been verified. `pending-downloads.json` is derived, not an independent source of truth. The journal is not claimed complete merely because the EBSCO queue is empty.

New tables preserve surrounding prose and existing URLs. A second render is byte-identical. `validate --links` checks structural PDF readability, recorded checksums, duplicate identifiers, table links, unlinked PDFs and index transclusions. No command deploys the website.
