import { google } from "googleapis"
import "dotenv/config"

const oauth2client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
)

async function initGoogleAuth(){
    if(!process.env.GOOGLE_REFRESH_TOKEN){
        throw new Error("Set the google refresh token before continue (hint: run generateToken.js")
    }

    oauth2client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })

    // test
    await oauth2client.getAccessToken()
}

export {oauth2client, initGoogleAuth}