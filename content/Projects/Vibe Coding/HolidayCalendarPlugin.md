---
title: Holiday Calendar Plugin
draft: false
tags:
  - project
  - tech/vibecoding
  - unfinished
description:
created: 2025-12-27
modified:
holiday:
---
# %%Summary%%
This is a Quartz component I vibecoded with Claude that displays a notes based on date using a frontmatter element named "holiday" and either the date or one of a preset list of named holidays like Christmas or Easter. It only appears on the index page of the site and is set to display the next seven days worth of notes.
# Function
*Although I vibecoded this entire thing, and also don't understand typescript, here's what I understand.*

The component does three things
1. Calculate the dates of the various moving holidays - Easter, Memorial Day, Thanksgiving, etc. - and assigns them and the preset holidays names
2. Searches the content folder for files with the `holiday` frontmatter tag and checks the contents for either valid holiday names or dates in the MM/DD format
3. Checks the date and displays a list of notes that are set for either today or a configurable amount of days in the future
# Installation
1. Download HolidayCalendar.tsx and add it to your ./quartz/components folder
2. Edit index.ts to export the component
3. Add the component to quartz.layout.ts. To change the number of upcoming days shown, use the `showUpcomingDays` argument as shown below:
	```
	Component.HolidayCalendar({ showUpcomingDays: 30 })
	```
# Holiday Aliases
## Current List
The following is a list of current holidays that will work with an alias
**Moving Holidays (Calculated):**
**Christian/Liturgical:**
- `advent1` - first Sunday of Advent
- `advent2` - second Sunday of Advent
- `advent3` - third Sunday of Advent
- `advent4` - fourth Sunday of Advent
- `shrove-tuesday` (or `mardi-gras`)
- `ash-wednesday`
- `easter`
- `good-friday`
- `pentecost`
- `trinity-sunday`
- `christ-the-king`
**US Federal/Observances:**
- `mlk-day`
- `presidents-day`
- `memorial-day`
- `labor-day`
- `thanksgiving`
**Other:**
- `mothers-day`
- `fathers-day`
**Fixed Date Holidays With Aliases:**
**US Civic:**
- `new-years-day` (1/1)
- `new-years-eve` (12/31)
- `independence-day` (7/4)
- `juneteenth` (6/19)
- `veterans-day` (11/11)
- `pearl-harbor-day` (12/7)
**Religious:**
- `valentines-day` (2/14)
- `st-patricks-day` (3/17)
- `halloween` (10/31)
- `all-saints-day` (11/1)
- `all-souls-day` (11/2)
- `christmas` (12/25)
**Other:**
- `groundhog-day` (2/2)
- `cinco-de-mayo` (5/5)
- `earth-day` (4/22)
- `d-day` (6/6)
## Things to Add
- Tax Day
- Election Day
- Full list of observances from 2019 Book of Common Prayer
- Other fun days
# Potential Improvements
In the future, I'd like to update this component (either myself or vibecoding) with a modular loading system so that users could add or remove lists of relevant dates like:
- US Federal Holidays
- State Specific Holidays
- Country Specific Holidays
- Various Liturgical Calendars
- Personal dates of significance or birthdays

The categories would also allow custom formatting depending on date so users could bold more significant days or color code different holidays in a way that was either generally useful to readers or portrayed fast information to superusers.
- Red highlighting for Red Letter Holy Days
- Bolding for US Federal holidays
- Italics for dates only personally significant
- etc.

Whether this ever gets off the ground remains to be seen