/* eslint-disable camelcase */
const fs = require('fs')
const { google } = require('googleapis')
const uuidv4 = require('uuid/v4')
const { updateMeetingGoogleInfo } = require('../../../modules/meeting/helpers')

const TOKEN_PATH = `${__dirname}/token.json`
const install = {
    client_id: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE",
    project_id: process.env.GOOGLE_PROJECT_ID || "YOUR_GOOGLE_PROJECT_ID_HERE",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET_HERE",
    redirect_uris: ["http://localhost", "https://app.hackjunction.com", "https://eu.junctionplatform.com"]
}
const credentialsJ = {
    installed: install
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, callbackParameter = null) {
    console.log("authorizing")
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
    )

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            console.log('Error loading google calendar token file')
            return false
        }

        oAuth2Client.setCredentials(JSON.parse(token))

        callback(oAuth2Client, callbackParameter)
    })
}

const insertEvent = (auth, eventInfo) => {

    const calendar = google.calendar({ version: 'v3', auth })
    calendar.events.insert(
        {
            auth,
            calendarId: 'primary',
            resource: eventInfo.googleEvent,
            conferenceDataVersion: 1,
        },
        (err, res) => {
            if (err) {
                console.log(
                    `There was an error contacting the Calendar service: ${err}`, res
                )
                // cancelMeeting(eventInfo.meetingId)
            } else {
                updateMeetingGoogleInfo(
                    eventInfo.meetingId,
                    res.data.id,
                    res.data.hangoutLink,
                )
            }
        },
    )
}

const deleteEvent = (auth, eventId) => {
    const calendar = google.calendar({ version: 'v3', auth })
    calendar.events.delete(
        {
            auth,
            calendarId: 'primary',
            eventId,
        },
        (err, res) => {
            if (err) {
                console.log('Error while deleting google event:', err)
            }
        },
    )
}

const deleteGoogleEvent = eventId => {
    try {
        authorize(JSON.parse(JSON.stringify(credentialsJ)), deleteEvent, eventId)
        return true

    } catch (err) {
        return false
    }
}

const createGoogleEvent = event => {
    console.log("creating google event")
    try {
        const googleEvent = {
            summary: event.title + " ||  " + event.desc || 'Junction: meeting with challenge partner',
            location: event.location || '',
            description: event.description || '',
            start: event.start,
            end: event.end,
            attendees: event.attendees,
            conferenceData: {
                createRequest: {
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet',
                    },
                    requestId: uuidv4(),
                },
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        }
        const eventInfo = {
            googleEvent,
            meetingId: event.meetingId,
        }

        authorize(JSON.parse(JSON.stringify(credentialsJ)), insertEvent, eventInfo)
        console.log("success")
        return true
    } catch (err) {
        console.log("no meets for you")
        return false
    }
}

module.exports = { createGoogleEvent, deleteGoogleEvent }