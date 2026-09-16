# CAD archive checkpoint — 2026-09-16

## Latest resumed work

- All 38 volume tables now use reviewed sentence-case display titles. Proper names/acronyms are preserved. Canonical bibliography, original source titles, PDF bytes, filenames and URLs are unchanged.
- `data/display-titles.json` stores 336 display labels. `prepare_display_titles.py` prepares labels using a collection-specific vocabulary; review newly generated titles before rendering. Renderer falls back to canonical titles for unknown IDs.
- The volume-38 introduction's display byline is Shanara Reid-Brinkley; raw EBSCO author capitalization is retained.
- `data/exceptions.md` now consolidates the four missing/misidentified articles, uncertain coverage and blocked build. `data/source-reconciliation.md` includes both volume-5 mislabels and additional citation evidence.
- Latest validation: `validate --links` passed; **11 tests passed**; zero changed PDF checksums; second render changed zero files; `git diff --check` passed with line-ending notices only.
- Additional research found bibliographic corroboration (including Brownlee 1984, pages 93–98), but no replacement PDFs. File count remains 331. No acquisition server was restarted and no build escalation was retried.
- Next work is historical source recovery and, only with renewed authorization, full Quartz build/display verification. The report consolidation and sentence-case work are complete.

The preceding checkpoint details below remain useful; its older counts of tests and pending report tasks are superseded by this section.

Stopped at the user's request. Do not restart inventory or redownload verified PDFs.

## Current state

- 331 PDFs across all 38 volumes; 38 volume pages and index transclusions.
- 111 PDFs added since the original 220; 92 added in this resumed session.
- All 141 EBSCO records now have local PDF matches. EBSCO acquisition queue is empty.
- Manifest: 218 present, 111 acquired, 2 identity_mismatch, 2 missing, 3 full_issue_only (336 records).
- All 220 original baseline checksums remain intact. 331 PDFs have 329 unique hashes: two pre-existing duplicate pairs, described below.
- New volume pages for 22–23, 25–30, 34–35 and 37; updated tables in 24 and 31–38. All new PDFs linked. Volume 5 flags two wrong-file entries.
- Volume 22 image scans were visually checked; review/byline corrections and checksum-bound identity evidence are recorded. Three truncated author lists were completed from PDFs.
- Volume 38 welcome and introduction extracted from preserved full issue: PDF page 3 (printed iii), PDF pages 8–15 (printed 3–10). Parent hashes and boundaries recorded. Journal information, contents and contributors link into full issue.
- Volumes 24 and 38 contents reconciled. Other volumes remain coverage unverified despite complete EBSCO matching. Do not claim journal completeness.

## Four outstanding source gaps

1. Volume 2: Psychological presumption: its place in value topic debate — Raymond Zeuschner / Charlene Hill.
2. Volume 2: CEDA's objectives: lest we forget — Jack Howe (1981, pages 1–3).
3. Volume 5: A projection of CEDA's near future — Don Brownlee. Original file duplicates volume 4's The philosophy and development of CEDA. Rendered first page verifies James E. Tomlinson's different article.
4. Volume 5: The case against counterwarrants in value proposition debate — Rich Simon. Original file duplicates Debating hasty generalization. Rendered first page verifies David M. Berube's different article.

The last two are identity_mismatch. Original bytes/URLs preserved; do not overwrite them. A correct replacement should get a new filename and retain provenance. Import currently refuses replacing existing PDFs, so a preservation-aware replacement operation would be needed when a source is found.

Citations corroborate the volume-2 pieces but no PDFs were found. Exact-title searches found no volume-5 replacement PDFs. Old CEDA/Wayback contents were unavailable through research tools. JMU introduction download returned 403; local full issue used instead. Source details are in data/source-reconciliation.md; that file still needs the two newly found volume-5 discrepancies added.

## Completed verification

- 10 utility tests pass: duplicate/variant records, same-title authors, collisions, corrupt PDFs, checksums, checksum-bound reviews, rendering idempotence, extraction offsets, transfer interruption/reruns, source pauses and three-retry limit.
- validate --links passed after import/render, before final volume-5 status changes. Rerun once next session.
- Second render changed zero files. Download sync imported zero files with no exceptions.
- Scratch reconciliation of all 141 EBSCO records created zero duplicates and changed no titles/authors/pages.
- git diff --check passed before final volume-5 update (line-ending notices only).
- Quartz build FAILED in sandbox: parent-directory access denied / could not resolve quartz/build.ts. Escalation request was DECLINED BY USER. Do not retry equivalent elevated build without renewed authorization. Build/display verification outstanding. No deployment or commit.

## Files / commands

Runtime: C:/Users/patri/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe

```powershell
$cadPython = 'C:/Users/patri/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
& $cadPython tools/cad/archive.py validate --links
& $cadPython tools/cad/archive.py report
& $cadPython -m unittest discover -s tools/cad -p 'test_*.py'
```

- archive.py: inventory, reconcile, import, review, extract, render, validate, report, sync-downloads.
- collector.py: loopback metadata/PDF transfer. Exact observed signed PDF assets successfully transferred via the authorized browser. No credentials/signed URLs saved in repo. /queue derives missing EBSCO records; /download stages, validates, imports and persists each file.
- Retry/source-pause hardening added after downloads and unit-tested. Initial attempt + 3 retries at 1/2/4 seconds; persistent pause on 401/403/429. --resume-source only after access restored.
- README.md and browser-workflow.md contain usage and sequential browser recipe.
- data/manifest.json authoritative; ebsco-records.json raw metadata; coverage.md generated; pending-downloads.json includes unresolved and parent-only records, not necessarily downloadable EBSCO items.
- Staging/review renders: ignored private/cad. Original 19 browser downloads remain in user Downloads.
- Collector STOPPED at checkpoint (session 96125 terminated). Browser state is unnecessary until a new source is available.

## Resume next

1. Rerun validation/tests after last report/status changes.
2. Add two volume-5 identity mismatches to source-reconciliation.md and consolidate an exception report (four source gaps, historical coverage uncertainty, blocked build).
3. Continue historical-source/contents research where possible. Preserve honest unknown coverage.
4. With renewed user authorization, run Quartz build and inspect changed pages/index. No deployment.

Preserve unrelated pre-existing poetry/fiction and other website edits/deletions. Resume from these files, not the prior 239-PDF checkpoint.
