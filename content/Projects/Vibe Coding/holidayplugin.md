---
title: Holiday Calendar Quartz Plugin
draft: false
tags:
  - project
  - tech/vibecoding
  - unfinished
  - tech/quartz
description:
created: 2025-12-27
modified: 2026-06-05
holiday:
---
This is a Quartz component I vibecoded that displays a notes based on date using a frontmatter element named "holiday" and either the date or one of a preset list of named holidays like Christmas or Easter. It only appears on the index page of the site and is set to display the next seven days worth of notes.

To install run the following:
```shell
npx quartz plugin add github:UndefeatedOrca/quartz-holiday-calendar
```

The full code for the Quartz 4 version of this plugin as of 12/29/25 is at the end of this note.
Repo is here: [UndefeatedOrca/quartz-holiday-calendar](https://github.com/UndefeatedOrca/quartz-holiday-calendar)
# Function
*Although I vibecoded this entire thing, and also don't understand typescript, here's what I understand.*

The component does three things
1. Calculate the dates of the various moving holidays - Easter, Memorial Day, Thanksgiving, etc. - and assigns them and the preset holidays names
2. Searches the content folder for files with the `holiday` frontmatter property and checks the contents for either valid holiday names or dates in the MM/DD format
3. Checks the date and displays a list of notes that are set for either today or a configurable amount of days in the future
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
- `palm-sunday`
- `good-friday`
- `easter`
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
- `epiphany` (1/6)
- `valentines-day` (2/14)
- `st-patricks-day` (3/17)
- `halloween` (10/31)
- `all-saints-day` (11/1)
- `all-souls-day` (11/2)
- `christmas-eve` (12/24)
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
# Quartz 4 Installation
1. Download HolidayCalendar.tsx and add it to your ./quartz/components folder
2. Edit index.ts to export the component
3. Add the component to quartz.layout.ts. To change the number of upcoming days shown, use the `showUpcomingDays` argument as shown below:
	```
	Component.HolidayCalendar({ showUpcomingDays: 30 })
	```
# Code
```ts
// When adding dates to this file, remember that Date objects in JavaScript are 0-indexed

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"

interface HolidayCalendarOptions {
  showUpcomingDays?: number // How many days ahead to show
}

const defaultOptions: HolidayCalendarOptions = {
  showUpcomingDays: 30,
}

// Easter calculation using Computus algorithm (Anonymous Gregorian algorithm)
function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

// Calculate Advent Sunday (4 Sundays before Christmas, numbered 0-3)
function calculateAdvent(year: number, sundayNumber: number): Date {
  const christmas = new Date(year, 11, 25) // December 25
  const christmasDay = christmas.getDay()
  
  // Calculate days from Christmas back to the nearest Sunday
  const daysToSunday = christmasDay === 0 ? 0 : christmasDay
  
  // Go back 4 weeks from that Sunday to get advent0 (first Sunday of Advent)
  const advent0Date = 25 - daysToSunday - 21 // 3 full weeks (21 days) before the last Sunday before Christmas
  const advent0 = new Date(year, 11, advent0Date)
  
  // If advent0 would be before November 27, it means we need to adjust
  // (Advent always starts on or after November 27, and no later than December 3)
  if (advent0Date < 27) {
    // Christmas is early in the week, so we need to go back one more week
    advent0.setDate(advent0Date + 7)
  }
  
  // Return the requested Advent Sunday (0-3)
  const adventDate = new Date(advent0)
  adventDate.setDate(advent0.getDate() + (sundayNumber * 7))
  return adventDate
}

// Calculate Christ the King Sunday (last Sunday before Advent, which is the Sunday before advent1)
function calculateChristKing(year: number): Date {
  const advent1 = calculateAdvent(year, 0) // First Sunday of Advent
  const christKing = new Date(advent1)
  christKing.setDate(advent1.getDate() - 7)
  return christKing
}

// Calculate nth weekday of month (e.g., 3rd Monday of January)
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1)
  const firstWeekday = firstDay.getDay()
  
  // Calculate days until first occurrence of target weekday
  let daysUntilWeekday = (weekday - firstWeekday + 7) % 7
  
  // Calculate the date of nth occurrence
  const targetDate = 1 + daysUntilWeekday + (n - 1) * 7
  return new Date(year, month, targetDate)
}

// Calculate last weekday of month
function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  // Start from last day of month and work backwards
  const lastDay = new Date(year, month + 1, 0)
  const lastDayWeekday = lastDay.getDay()
  
  const daysBack = (lastDayWeekday - weekday + 7) % 7
  return new Date(year, month, lastDay.getDate() - daysBack)
}

// Calculate all moving holidays for a given year
function calculateMovingHolidays(year: number): Map<string, Date> {
  const holidays = new Map<string, Date>()
  
  // Easter-based holidays
  const easter = calculateEaster(year)
  holidays.set("easter", easter)
  
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  holidays.set("good-friday", goodFriday)
  
  const ashWednesday = new Date(easter)
  ashWednesday.setDate(easter.getDate() - 46)
  holidays.set("ash-wednesday", ashWednesday)
  
  const shroveTuesday = new Date(easter)
  shroveTuesday.setDate(easter.getDate() - 47)
  holidays.set("shrove-tuesday", shroveTuesday)
  holidays.set("mardi-gras", shroveTuesday)
  
  const pentecost = new Date(easter)
  pentecost.setDate(easter.getDate() + 49)
  holidays.set("pentecost", pentecost)
  
  const trinitySunday = new Date(easter)
  trinitySunday.setDate(easter.getDate() + 56)
  holidays.set("trinity-sunday", trinitySunday)

  const palmSunday = new Date(easter)
  palmSunday.setDate(easter.getDate() - 7)
  holidays.set("palm-sunday", palmSunday)
  
  // Advent Sundays (1-4, the four Sundays of Advent)
  holidays.set("advent1", calculateAdvent(year, 0))
  holidays.set("advent2", calculateAdvent(year, 1))
  holidays.set("advent3", calculateAdvent(year, 2))
  holidays.set("advent4", calculateAdvent(year, 3))
  
  // Christ the King
  holidays.set("christ-the-king", calculateChristKing(year))
  
  // US Federal holidays
  holidays.set("mlk-day", getNthWeekdayOfMonth(year, 0, 1, 3)) // 3rd Monday of January
  holidays.set("presidents-day", getNthWeekdayOfMonth(year, 1, 1, 3)) // 3rd Monday of February
  holidays.set("memorial-day", getLastWeekdayOfMonth(year, 4, 1)) // Last Monday of May
  holidays.set("labor-day", getNthWeekdayOfMonth(year, 8, 1, 1)) // 1st Monday of September
  holidays.set("thanksgiving", getNthWeekdayOfMonth(year, 10, 4, 4)) // 4th Thursday of November
  
  // Other holidays
  holidays.set("mothers-day", getNthWeekdayOfMonth(year, 4, 0, 2)) // 2nd Sunday of May
  holidays.set("fathers-day", getNthWeekdayOfMonth(year, 5, 0, 3)) // 3rd Sunday of June
  
  // Fixed date holidays (US Civic)
  holidays.set("new-years-day", new Date(year, 0, 1))
  holidays.set("new-years-eve", new Date(year, 11, 31))
  holidays.set("valentines-day", new Date(year, 1, 14))
  holidays.set("st-patricks-day", new Date(year, 2, 17))
  holidays.set("independence-day", new Date(year, 6, 4))
  holidays.set("juneteenth", new Date(year, 5, 19))
  holidays.set("veterans-day", new Date(year, 10, 11))
  holidays.set("pearl-harbor-day", new Date(year, 11, 7))
  
  // Fixed date holidays (Religious)
  holidays.set("epiphany", new Date(year, 0, 6)) // January 6
  holidays.set("halloween", new Date(year, 9, 31)) // October 31
  holidays.set("all-saints-day", new Date(year, 10, 1)) // November 1
  holidays.set("all-souls-day", new Date(year, 10, 2)) // November 2
  holidays.set("christmas-eve", new Date(year, 11, 24)) // December 24
  holidays.set("christmas", new Date(year, 11, 25)) // December 25
  
  // Fixed date holidays (Other popular)
  holidays.set("groundhog-day", new Date(year, 1, 2))
  holidays.set("cinco-de-mayo", new Date(year, 4, 5))
  holidays.set("earth-day", new Date(year, 3, 22))
  holidays.set("d-day", new Date(year, 5, 6))
  
  return holidays
}

export default ((opts?: Partial<HolidayCalendarOptions>) => {
  const options: HolidayCalendarOptions = { ...defaultOptions, ...opts }

  const HolidayCalendar: QuartzComponent = (props: QuartzComponentProps) => {
    const { allFiles, fileData } = props

    // Get current year and calculate all moving holidays
    const today = new Date()
    const currentYear = today.getFullYear()
    const movingHolidays = calculateMovingHolidays(currentYear)
    
    // Create a map of dates to holiday names for reverse lookup
    const dateToHolidays = new Map<string, string[]>()
    movingHolidays.forEach((date, holidayName) => {
      const dateKey = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
      if (!dateToHolidays.has(dateKey)) {
        dateToHolidays.set(dateKey, [])
      }
      dateToHolidays.get(dateKey)!.push(holidayName)
    })

    // Get all files with holiday frontmatter
    const holidayPattern = /^(\d{2})\/(\d{2})$/
    const holidayNotes: Map<string, QuartzPluginData[]> = new Map()

    allFiles.forEach((file) => {
      const holiday = file.frontmatter?.holiday
      if (!holiday) return

      // Handle both single date strings and arrays of dates
      const dates = Array.isArray(holiday) ? holiday : [holiday]
      
      dates.forEach((dateStr: string) => {
        // Check if it's a fixed date (MM/DD format)
        const fixedMatch = String(dateStr).match(holidayPattern)
        if (fixedMatch) {
          const [, month, day] = fixedMatch
          const dateKey = `${month}/${day}`
          if (!holidayNotes.has(dateKey)) {
            holidayNotes.set(dateKey, [])
          }
          holidayNotes.get(dateKey)!.push(file)
        } 
        // Check if it's a moving holiday name
        else if (movingHolidays.has(String(dateStr).toLowerCase())) {
          const holidayDate = movingHolidays.get(String(dateStr).toLowerCase())!
          const dateKey = `${String(holidayDate.getMonth() + 1).padStart(2, "0")}/${String(holidayDate.getDate()).padStart(2, "0")}`
          if (!holidayNotes.has(dateKey)) {
            holidayNotes.set(dateKey, [])
          }
          holidayNotes.get(dateKey)!.push(file)
        }
      })
    })

    const todayKey = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`
    const todayNotes = holidayNotes.get(todayKey) || []

    // Get upcoming dates
    const upcomingHolidays: Array<{ date: Date; dateKey: string; notes: QuartzPluginData[]; holidayNames: string[] }> = []

    for (let i = 1; i <= options.showUpcomingDays!; i++) {
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + i)
      const futureDateKey = `${String(futureDate.getMonth() + 1).padStart(2, "0")}/${String(futureDate.getDate()).padStart(2, "0")}`

      if (holidayNotes.has(futureDateKey)) {
        upcomingHolidays.push({
          date: futureDate,
          dateKey: futureDateKey,
          notes: holidayNotes.get(futureDateKey)!,
          holidayNames: dateToHolidays.get(futureDateKey) || [],
        })
      }
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    }
    
    const formatHolidayName = (name: string) => {
      return name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    }

    const renderNoteList = (notes: QuartzPluginData[]) => {
      return (
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          {notes.map((note) => {
            const href = resolveRelative(fileData.slug!, note.slug!)
            return (
              <li key={note.slug}>
                <a href={href} class="internal">
                  {note.frontmatter?.title || note.slug}
                </a>
              </li>
            )
          })}
        </ul>
      )
    }

    // Don't render if no holiday content
    if (holidayNotes.size === 0) {
      return null
    }

    const todayHolidayNames = dateToHolidays.get(todayKey) || []

    return (
      <div class="holiday-calendar" style="margin: 1.5 rem 0; padding: 1.5rem; border: 1px solid var(--lightgray); border-radius: 8px; background: var(--light); max height 800px; overflow-y: auto;">
        {todayNotes.length > 0 && (
          <div style="margin-bottom: 0.25rem;">
            <h4 style="margin: 0 0 0.5rem 0;">
              {formatDate(today)}
              {todayHolidayNames.length > 0 && (
                <span>
                  {" - "}{todayHolidayNames.map(formatHolidayName).join(", ")}
                </span>
              )}
            </h4>
            {renderNoteList(todayNotes)}
          </div>
        )}

        {upcomingHolidays.length > 0 && (
          <div>
            {upcomingHolidays.map(({ date, dateKey, notes, holidayNames }) => (
              <div key={dateKey} style="margin-bottom: 0.25rem;">
                <h5 style="margin: 0 0 0.25rem 0; color: var(--darkgray);">
                  {formatDate(date)}
                  {holidayNames.length > 0 && (
                    <span>
                      {" - "}{holidayNames.map(formatHolidayName).join(", ")}
                    </span>
                  )}
                </h5>
                {renderNoteList(notes)}
              </div>
            ))}
          </div>
        )}

        {todayNotes.length === 0 && upcomingHolidays.length === 0 && (
          <p style="color: var(--gray); font-style: italic;">No holidays in the next {options.showUpcomingDays} days</p>
        )}
      </div>
    )
  }

  return HolidayCalendar
}) satisfies QuartzComponentConstructor
```

## current code
>[!warning] This might not work
>The old code requires a new sync to update the calendar. In theory, this doesn't. In practice, I updated it at a time when there aren't any holidays so I actually have no idea if it worked or not.
```ts
// When adding dates to this file, remember that Date objects in JavaScript are 0-indexed

  

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

import { resolveRelative } from "../util/path"

  

interface HolidayCalendarOptions {

  showUpcomingDays?: number // How many days ahead to show

}

  

const defaultOptions: HolidayCalendarOptions = {

  showUpcomingDays: 30,

}

  

// Easter calculation using Computus algorithm (Anonymous Gregorian algorithm)

function calculateEaster(year: number): Date {

  const a = year % 19

  const b = Math.floor(year / 100)

  const c = year % 100

  const d = Math.floor(b / 4)

  const e = b % 4

  const f = Math.floor((b + 8) / 25)

  const g = Math.floor((b - f + 1) / 3)

  const h = (19 * a + b - d - g + 15) % 30

  const i = Math.floor(c / 4)

  const k = c % 4

  const l = (32 + 2 * e + 2 * i - h - k) % 7

  const m = Math.floor((a + 11 * h + 22 * l) / 451)

  const month = Math.floor((h + l - 7 * m + 114) / 31)

  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month - 1, day)

}

  

// Calculate Advent Sunday (4 Sundays before Christmas, numbered 0-3)

function calculateAdvent(year: number, sundayNumber: number): Date {

  const christmas = new Date(year, 11, 25) // December 25

  const christmasDay = christmas.getDay()

  // Calculate days from Christmas back to the nearest Sunday

  const daysToSunday = christmasDay === 0 ? 0 : christmasDay

  // Go back 4 weeks from that Sunday to get advent0 (first Sunday of Advent)

  const advent0Date = 25 - daysToSunday - 21 // 3 full weeks (21 days) before the last Sunday before Christmas

  const advent0 = new Date(year, 11, advent0Date)

  // If advent0 would be before November 27, it means we need to adjust

  // (Advent always starts on or after November 27, and no later than December 3)

  if (advent0Date < 27) {

    // Christmas is early in the week, so we need to go back one more week

    advent0.setDate(advent0Date + 7)

  }

  // Return the requested Advent Sunday (0-3)

  const adventDate = new Date(advent0)

  adventDate.setDate(advent0.getDate() + (sundayNumber * 7))

  return adventDate

}

  

// Calculate Christ the King Sunday (last Sunday before Advent, which is the Sunday before advent1)

function calculateChristKing(year: number): Date {

  const advent1 = calculateAdvent(year, 0) // First Sunday of Advent

  const christKing = new Date(advent1)

  christKing.setDate(advent1.getDate() - 7)

  return christKing

}

  

// Calculate nth weekday of month (e.g., 3rd Monday of January)

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {

  const firstDay = new Date(year, month, 1)

  const firstWeekday = firstDay.getDay()

  // Calculate days until first occurrence of target weekday

  let daysUntilWeekday = (weekday - firstWeekday + 7) % 7

  // Calculate the date of nth occurrence

  const targetDate = 1 + daysUntilWeekday + (n - 1) * 7

  return new Date(year, month, targetDate)

}

  

// Calculate last weekday of month

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {

  // Start from last day of month and work backwards

  const lastDay = new Date(year, month + 1, 0)

  const lastDayWeekday = lastDay.getDay()

  const daysBack = (lastDayWeekday - weekday + 7) % 7

  return new Date(year, month, lastDay.getDate() - daysBack)

}

  

// Calculate all moving holidays for a given year

function calculateMovingHolidays(year: number): Map<string, Date> {

  const holidays = new Map<string, Date>()

  // Easter-based holidays

  const easter = calculateEaster(year)

  holidays.set("easter", easter)

  const goodFriday = new Date(easter)

  goodFriday.setDate(easter.getDate() - 2)

  holidays.set("good-friday", goodFriday)

  const ashWednesday = new Date(easter)

  ashWednesday.setDate(easter.getDate() - 46)

  holidays.set("ash-wednesday", ashWednesday)

  const shroveTuesday = new Date(easter)

  shroveTuesday.setDate(easter.getDate() - 47)

  holidays.set("shrove-tuesday", shroveTuesday)

  holidays.set("mardi-gras", shroveTuesday)

  const pentecost = new Date(easter)

  pentecost.setDate(easter.getDate() + 49)

  holidays.set("pentecost", pentecost)

  const trinitySunday = new Date(easter)

  trinitySunday.setDate(easter.getDate() + 56)

  holidays.set("trinity-sunday", trinitySunday)

  

  const palmSunday = new Date(easter)

  palmSunday.setDate(easter.getDate() - 7)

  holidays.set("palm-sunday", palmSunday)

  // Advent Sundays (1-4, the four Sundays of Advent)

  holidays.set("advent1", calculateAdvent(year, 0))

  holidays.set("advent2", calculateAdvent(year, 1))

  holidays.set("advent3", calculateAdvent(year, 2))

  holidays.set("advent4", calculateAdvent(year, 3))

  // Christ the King

  holidays.set("christ-the-king", calculateChristKing(year))

  // US Federal holidays

  holidays.set("mlk-day", getNthWeekdayOfMonth(year, 0, 1, 3)) // 3rd Monday of January

  holidays.set("presidents-day", getNthWeekdayOfMonth(year, 1, 1, 3)) // 3rd Monday of February

  holidays.set("memorial-day", getLastWeekdayOfMonth(year, 4, 1)) // Last Monday of May

  holidays.set("labor-day", getNthWeekdayOfMonth(year, 8, 1, 1)) // 1st Monday of September

  holidays.set("thanksgiving", getNthWeekdayOfMonth(year, 10, 4, 4)) // 4th Thursday of November

  // Other holidays

  holidays.set("mothers-day", getNthWeekdayOfMonth(year, 4, 0, 2)) // 2nd Sunday of May

  holidays.set("fathers-day", getNthWeekdayOfMonth(year, 5, 0, 3)) // 3rd Sunday of June

  // Fixed date holidays (US Civic)

  holidays.set("new-years-day", new Date(year, 0, 1))

  holidays.set("new-years-eve", new Date(year, 11, 31))

  holidays.set("valentines-day", new Date(year, 1, 14))

  holidays.set("st-patricks-day", new Date(year, 2, 17))

  holidays.set("independence-day", new Date(year, 6, 4))

  holidays.set("juneteenth", new Date(year, 5, 19))

  holidays.set("veterans-day", new Date(year, 10, 11))

  holidays.set("pearl-harbor-day", new Date(year, 11, 7))

  // Fixed date holidays (Religious)

  holidays.set("epiphany", new Date(year, 0, 6)) // January 6

  holidays.set("halloween", new Date(year, 9, 31)) // October 31

  holidays.set("all-saints-day", new Date(year, 10, 1)) // November 1

  holidays.set("all-souls-day", new Date(year, 10, 2)) // November 2

  holidays.set("christmas-eve", new Date(year, 11, 24)) // December 24

  holidays.set("christmas", new Date(year, 11, 25)) // December 25

  // Fixed date holidays (Other popular)

  holidays.set("groundhog-day", new Date(year, 1, 2))

  holidays.set("cinco-de-mayo", new Date(year, 4, 5))

  holidays.set("earth-day", new Date(year, 3, 22))

  holidays.set("d-day", new Date(year, 5, 6))

  return holidays

}

  

// Serialize holiday note data for client-side use

interface SerializedNote {

  slug: string

  title: string

  href: string

}

  

interface SerializedHolidayEntry {

  /** MM/DD */

  dateKey: string

  /** ISO date string for the year the entry was calculated for */

  isoDate: string

  notes: SerializedNote[]

  holidayNames: string[]

}

  

export default ((opts?: Partial<HolidayCalendarOptions>) => {

  const options: HolidayCalendarOptions = { ...defaultOptions, ...opts }

  

  const HolidayCalendar: QuartzComponent = (props: QuartzComponentProps) => {

    const { allFiles, fileData } = props

  

    // We need to cover this year AND next year so that a page loaded in

    // late December can still show entries that fall in early January.

    const buildYear = new Date().getFullYear()

    const years = [buildYear, buildYear + 1]

  

    // Build a combined MM/DD → Date map across both years so we can resolve

    // moving-holiday *names* (e.g. "easter") to their actual calendar dates.

    // When the same MM/DD appears in both years we keep both; the client will

    // pick whichever one is currently relevant.

    const movingHolidaysByYear: Map<number, Map<string, Date>> = new Map()

    years.forEach((y) => movingHolidaysByYear.set(y, calculateMovingHolidays(y)))

  

    // Helper: convert a Date → "MM/DD"

    const toDateKey = (d: Date) =>

      `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`

  

    // ── Build a complete entry map: dateKey → { notes[], holidayNames[], isoDate } ──

    // We compute one entry per (dateKey × year) pair so the client can always

    // resolve the correct year from "today".

    const entryMap = new Map<

      string, // "MM/DD|YYYY"

      { dateKey: string; isoDate: string; notes: SerializedNote[]; holidayNames: string[] }

    >()

  

    const getOrCreate = (dateKey: string, year: number, date: Date) => {

      const key = `${dateKey}|${year}`

      if (!entryMap.has(key)) {

        entryMap.set(key, {

          dateKey,

          isoDate: date.toISOString(),

          notes: [],

          holidayNames: [],

        })

      }

      return entryMap.get(key)!

    }

  

    // Populate holidayNames from the moving-holiday maps

    years.forEach((year) => {

      const map = movingHolidaysByYear.get(year)!

      map.forEach((date, name) => {

        const dk = toDateKey(date)

        const entry = getOrCreate(dk, year, date)

        if (!entry.holidayNames.includes(name)) entry.holidayNames.push(name)

      })

    })

  

    // Populate notes from file frontmatter

    const holidayPattern = /^(\d{2})\/(\d{2})$/

    allFiles.forEach((file) => {

      const holiday = file.frontmatter?.holiday

      if (!holiday) return

  

      const dates = Array.isArray(holiday) ? holiday : [holiday]

  

      dates.forEach((dateStr: string) => {

        const fixedMatch = String(dateStr).match(holidayPattern)

  

        if (fixedMatch) {

          // Fixed date (MM/DD) — applies to every year

          const [, month, day] = fixedMatch

          const dk = `${month}/${day}`

          years.forEach((year) => {

            const date = new Date(year, Number(month) - 1, Number(day))

            const entry = getOrCreate(dk, year, date)

            entry.notes.push({

              slug: file.slug!,

              title: String(file.frontmatter?.title ?? file.slug),

              href: resolveRelative(fileData.slug!, file.slug!),

            })

          })

        } else {

          // Moving holiday name — resolve per year

          const normalised = String(dateStr).toLowerCase()

          years.forEach((year) => {

            const map = movingHolidaysByYear.get(year)!

            if (!map.has(normalised)) return

            const date = map.get(normalised)!

            const dk = toDateKey(date)

            const entry = getOrCreate(dk, year, date)

            const note: SerializedNote = {

              slug: file.slug!,

              title: String(file.frontmatter?.title ?? file.slug),

              href: resolveRelative(fileData.slug!, file.slug!),

            }

            if (!entry.notes.find((n) => n.slug === note.slug)) {

              entry.notes.push(note)

            }

          })

        }

      })

    })

  

    // Only emit entries that actually have notes attached

    const serialized: SerializedHolidayEntry[] = Array.from(entryMap.values()).filter(

      (e) => e.notes.length > 0,

    )

  

    if (serialized.length === 0) return null

  

    const dataJson = JSON.stringify(serialized)

    const showDays = options.showUpcomingDays!

  

    return (

      <div

        class="holiday-calendar"

        data-holiday-entries={dataJson}

        data-show-upcoming-days={String(showDays)}

        style="margin: 1.5rem 0; padding: 1.5rem; border: 1px solid var(--lightgray); border-radius: 8px; background: var(--light); max-height: 800px; overflow-y: auto;"

      >

        {/* Content is rendered client-side; this placeholder avoids layout shift */}

        <p class="holiday-calendar-loading" style="color: var(--gray); font-style: italic;">

          Loading calendar…

        </p>

      </div>

    )

  }

  

  // ── Client-side script ──────────────────────────────────────────────────────

  // Quartz runs afterDOMLoaded scripts after every client-side navigation,

  // so "today" is always evaluated at the moment the user views the page —

  // no rebuild required.

  HolidayCalendar.afterDOMLoaded = `

    (function () {

      function formatHolidayName(name) {

        return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

      }

  

      function formatDate(dateStr) {

        // dateStr is an ISO string; parse as local date to avoid UTC-offset shift

        const [year, month, day] = dateStr.split("T")[0].split("-").map(Number)

        const d = new Date(year, month - 1, day)

        return d.toLocaleDateString("en-US", { month: "long", day: "numeric" })

      }

  

      function renderNoteList(notes) {

        return "<ul style='margin:0.5rem 0;padding-left:1.5rem;'>" +

          notes.map(n =>

            "<li><a href='" + n.href + "' class='internal'>" + n.title + "</a></li>"

          ).join("") +

          "</ul>"

      }

  

      function render(container) {

        const raw = container.dataset.holidayEntries

        const showDays = parseInt(container.dataset.showUpcomingDays || "30", 10)

        if (!raw) return

  

        const entries = JSON.parse(raw)   // SerializedHolidayEntry[]

  

        const today = new Date()

        // Strip time component so day-diff maths works cleanly

        today.setHours(0, 0, 0, 0)

  

        // Build a map: isoDate-prefix (YYYY-MM-DD) → entry

        const byDate = new Map()

        entries.forEach(entry => {

          const prefix = entry.isoDate.split("T")[0]

          byDate.set(prefix, entry)

        })

  

        // Find today's entry and upcoming entries

        const pad = n => String(n).padStart(2, "0")

        const todayPrefix = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate())

  

        const todayEntry = byDate.get(todayPrefix) || null

        const upcoming = []

  

        for (let i = 1; i <= showDays; i++) {

          const future = new Date(today)

          future.setDate(today.getDate() + i)

          const prefix = future.getFullYear() + "-" + pad(future.getMonth() + 1) + "-" + pad(future.getDate())

          if (byDate.has(prefix)) {

            upcoming.push(byDate.get(prefix))

          }

        }

  

        let html = ""

  

        if (todayEntry) {

          const names = todayEntry.holidayNames.map(formatHolidayName).join(", ")

          html += "<div style='margin-bottom:0.25rem;'>"

          html += "<h4 style='margin:0 0 0.5rem 0;'>"

          html += formatDate(todayEntry.isoDate)

          if (names) html += " <span>- " + names + "</span>"

          html += "</h4>"

          html += renderNoteList(todayEntry.notes)

          html += "</div>"

        }

  

        upcoming.forEach(entry => {

          const names = entry.holidayNames.map(formatHolidayName).join(", ")

          html += "<div style='margin-bottom:0.25rem;'>"

          html += "<h5 style='margin:0 0 0.25rem 0;color:var(--darkgray);'>"

          html += formatDate(entry.isoDate)

          if (names) html += " <span>- " + names + "</span>"

          html += "</h5>"

          html += renderNoteList(entry.notes)

          html += "</div>"

        })

  

        if (!todayEntry && upcoming.length === 0) {

          html = "<p style='color:var(--gray);font-style:italic;'>No holidays in the next " + showDays + " days</p>"

        }

  

        container.innerHTML = html

      }

  

      document.querySelectorAll(".holiday-calendar[data-holiday-entries]").forEach(render)

    })()

  `

  

  return HolidayCalendar

}) satisfies QuartzComponentConstructor
```