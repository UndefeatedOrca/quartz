---
title: To-Do List
draft: false
tags:
description:
created: 2025-12-22
modified: 2025-12-28
---

This is the list of ongoing or yet to be completed tasks on the website. I'm a little worried it's going to get longer before it gets shorter.
# In progress
## High Priority
- [ ] Upgrade to quartz 5 - prereq for all following
	- [ ] Update [[downloadtransformer]]
	- [ ] Update [[holidayplugin]]
	- [ ] Implement [[quartzvibecodestarts]]
		- This probably turns into an accessibility suite, I'd like to have a font switcher, beeline, and maybe a quartz version of [[readingruler]] eventually
		- Recursive popovers need more vibe-coded iteration, and it would be nice to at least get working wikipedia popups too -- full scale popups of archived other sites like [gwern.net](gwern.net) is probably overkill, but if there's a way to make some more iframes work, that would be cool
	- [ ] Accessibility suite -- see above
	- [ ] Add random note button
		- I wonder if I could fit it in with the reader mode and the night mode toggle switch and just shrink the search bar a bit
		- The icon should be the face of a six sided die, and pressing it should roll the die along with going to a random note
	- [ ] Favicons
	- [ ] Twitter embeds
	- [ ] Youtube embeds
- [ ] Customize color scheme
## Low Priority
- [ ] Configure a custom callout for tangents using [this info](https://quartz.jzhao.xyz/features/callouts)
- [ ] Built in audio player
- [ ] Go steal a bunch of other people's site design ideas
	- [ ] [Turntrout](https://turntrout.com/design)
		- [ ] Spoiler text
		- [ ] favicons
		- [ ] dropcaps
	- [ ] [Eilleeenz](https://quartz.eilleeenz.com/Quartz-Snippets)
		- [ ] twitter embeds
		- [ ] also has spoilers - this feels like it should maybe be stock behavior
		- [ ] also has favicons, several option
		- [ ] random page
		- [ ] underline external links
		- [ ] custom callout formatting and blocks
	- In some instances, it might make more sense to vibecode the features
- [ ] Custom aesthetic divider (with randomized quote right after page content?)
- [ ] Consider moving the [debate archive](policy/Debate/DebateArchive/index|index) to a separate site
# Complete
- [x] Fix failure to build
	- it wasn't actually an issue
- [x] Fix line breaks
- [x] Tag poems I wrote over the past six months
- [x] Sanitize my personal copies of poems
- [x] Upload poems to folders
- [x] Move convert-frontmatter.js to quartz folder
- [x] Run convert-frontmatter.js
- [x] Update how tags work
- [x] Create working attachments folder that doesn't show up in the explorer - just implement Claude fix
- [x] Identify why files are randomly disappearing
	- some kind of git issue
- [x] Copy over rants from Rumbles on Every Horizon
- [x] Copy over rants from Patrick's Daily Poem
- [x] Copy over writing from Valor Dictus
- [x] See if I can change how social media previews handle line breaks
	- gave up on this lol
- [x] Update \[\[whoami]]
	- [x] Figure out how much should be going on the homepage
- [x] Write \[\[sitedesign]]
- [x] Add cool little links to my socials in the corner
	- this probably just means editing the footer
- [x] Add collapsible tangent blocks and/or figure out how to use them and other components
- [x] Figure out analytics
- [x] Tag \#poem/food
- [x] Tag \#poem/music
- [x] Tag \#author/MacDonald
- [x] Implement vibe-coded holiday calendar plugin
- [x] Update Claude's convert-frontmatter script to handle existing frontmatter
- [x] Add holidays to frontmatter of relevant notes
- [x] Fix tag hierarchy
- [x] Update graph settings
- [x] Consider adding comments section
	- no