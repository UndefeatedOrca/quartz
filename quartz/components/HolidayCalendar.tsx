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
  holidays.set("halloween", new Date(year, 9, 31))
  holidays.set("all-saints-day", new Date(year, 10, 1))
  holidays.set("all-souls-day", new Date(year, 10, 2))
  holidays.set("christmas", new Date(year, 11, 25))
  
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