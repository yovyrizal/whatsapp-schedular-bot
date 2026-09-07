import { google } from "googleapis"
import { initGoogleAuth, oauth2client } from "./googleAuth.js"

const calendar = google.calendar({ version: "v3", auth: oauth2client })

async function createEvent({ title, start_datetime, end_datetime, desc}) {
    const event = {
        summary: title,
        description: desc || undefined,
        start: {
            dateTime: start_datetime,
            timeZone: "Asia/Jakarta",
        },
        end: {
            dateTime: end_datetime,
            timeZone: "Asia/Jakarta",
        }
    }

    try{
        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
        })

        console.log(response.data)
    } catch(err){
        console.error(err)
    }
}

// Testing
async function main(){
    await initGoogleAuth();

    createEvent({summary: "test", start_datetime: "2026-09-08T15:00:00+07:00", end_datetime: "2026-09-08T15:00:05+07:00", desc: "ini cuma test"})
}

main()