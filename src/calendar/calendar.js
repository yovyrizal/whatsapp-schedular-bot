import { google } from "googleapis"
import { oauth2client } from "./googleAuth.js"

const calendar = google.calendar({ version: "v3", auth: oauth2client })

createEvent("test", "2026-09-06T15:00:00+07:00", "2026-09-06T15:00:05+07:00", "ini cuma test")

async function createEvent({ title, start_datetime, end_datetime, desc}) {
    const event = {
        summary: title,
        description: desc || undefined,
        start: {
            dateTime: start_datetime,
            timezone: "Asia/Jakarta",
        },
        end: {
            dateTime: end_datetime,
            timezone: "Asia/Jakarta",
        }
    }

    try{
        const response = await calendar.events.insert({
            calendarId: "Primary",
            requestBody: event,
        })

        console.log(response.data)
    } catch(err){
        console.error(err)
    }
}