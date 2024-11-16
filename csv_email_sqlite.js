const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const https = require('https');

// Path to CSV file
const csvFilePath = 'combined_output.csv';

// SQLite DB setup
const db = new sqlite3.Database('apollo_prospects.db');

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS prospects (
            id TEXT PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            name TEXT,
            linkedin_url TEXT,
            title TEXT,
            organization_name TEXT,
            present_raw_address TEXT,
            email TEXT,
            phone TEXT,
            time_zone TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    `);
});

// Function to check if a person already exists in the database
function personExists(personId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id FROM prospects WHERE id = ?`, [personId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row); // If a row exists, return true; otherwise, false
            }
        });
    });
}

// Function to insert data into SQLite
function insertData(contact) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO prospects 
            (id, first_name, last_name, name, linkedin_url, title, organization_name, present_raw_address, email, phone, time_zone, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                contact.id,
                contact.first_name,
                contact.last_name,
                contact.name,
                contact.linkedin_url,
                contact.title,
                contact.organization_name,
                contact.present_raw_address,
                contact.email || 'No Email', // Insert default if no email
                contact.phone_numbers && contact.phone_numbers.length > 0
                    ? contact.phone_numbers[0].sanitized_number
                    : null,
                contact.time_zone,
                contact.created_at,
                contact.updated_at,
            ],
            function (err) {
                if (err) {
                    console.error(`Error inserting data for ${contact.name}:`, err.message);
                    reject(err);
                } else {
                    console.log(`Inserted/Updated data for ${contact.name}`);
                    resolve();
                }
            }
        );
    });
}

// Function to simulate a random delay
function randomDelay() {
    return new Promise((resolve) => {
        const delay = Math.random() * 4000; // Random delay between 0 and 2 seconds
        setTimeout(resolve, delay);
    });
}

// Function to process each user ID from the CSV
async function processUserId(personId) {
    const csrfToken = 'GV3_q8n5KaJ2F33VcdR6_ngqfe4pWpvEGdkMizsJWejDw2yCPz5ir2rzrzxzSpN3IHWGvNQfoxRy1K0XS7zqsA'; // Replace with actual CSRF token
    const cookie = 'zp__initial_referrer=https://www.google.com/; zp__initial_landing_page=https://www.apollo.io/; zp__utm_source=www.google.com; zp__initial_utm_source=www.google.com; pscd=get.apollo.io; zp__utm_medium=(none); zp__initial_utm_medium=(none); __cf_bm=fs4EEn0zUS.1nb0IQ8QpP9IshKeWGZrHlfPCPQYJmI4-1727226461-1.0.1.1-LJhA_ItYqa47Yf43YFdPMGpNteoHXUf3cvpaKaw7GA.2jIugn7bRuaPZeBf3bqdtfIhPN6vxAWxDgwh0bHtPsA; GCLB=CKeLz-D4lcXwWhAD; remember_token_leadgenie_v2=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqWTJaak0yTTJSaFptUmhaVGM0TURGaU16bGtOVEkzWTE5c1pXRmtaMlZ1YVdWamIyOXJhV1ZvWVhOb0lnPT0iLCJleHAiOiIyMDI0LTEwLTI1VDAxOjE1OjA2Ljk0OVoiLCJwdXIiOiJjb29raWUucmVtZW1iZXJfdG9rZW5fbGVhZGdlbmllX3YyIn19--a0324be19c4a49ab744e5d465ca2e1270c91547e; ZP_LATEST_LOGIN_PRICING_VARIANT=24Q3_W59_100; ZP_Pricing_Split_Test_Variant=24Q3_W59_100; intercom-device-id-dyws6i9m=bc16d816-56f2-4bd7-8f59-cd1d353e4fde; amplitude_id_122a93c7d9753d2fe678deffe8fac4cfapollo.io=eyJkZXZpY2VJZCI6IjA1Yjk4N2ExLTEyZjQtNDM2OS04YWQ3LTMxYjc5MzFjMWZkN1IiLCJ1c2VySWQiOiI2NmYzNjNkYWZkYWU3ODAxYjM5ZDUyN2MiLCJvcHRPdXQiOnRydWUsInNlc3Npb25JZCI6MTcyNzIyNjg2NjAyMiwibGFzdEV2ZW50VGltZSI6MTcyNzIyNjkwNjg4NCwiZXZlbnRJZCI6OCwiaWRlbnRpZnlJZCI6MCwic2VxdWVuY2VOdW1iZXIiOjh9; intercom-session-dyws6i9m=VFRCeE80MytkTFk4Q3pSaWVvLytqNllhQ3h3aDNwamtPUjRDdlN4Z1dHQ0FlZ0QvTVdPYXN5UlArVXBKc3JTNS0tSjlLaUlBNEo1bDRKV0h4ODFheDdFdz09--6d01a9de40c27f8a889dbb9fd2d8832b62224c8b; _dd_s=rum=0&expire=1727227855680; X-CSRF-TOKEN=GV3_q8n5KaJ2F33VcdR6_ngqfe4pWpvEGdkMizsJWejDw2yCPz5ir2rzrzxzSpN3IHWGvNQfoxRy1K0XS7zqsA; _leadgenie_session=ltKhqjDAR%2BJKcdBWMP45tsC0DmN4a%2BEuRB6EQRZJPM92ZKyQUMHToZp%2BbpV6iL0cotIQEbeQL17z6tLtLpDZT0EQ2Su4JFxDEWEbA3sLR6JgFn4zdKOYizjF8NTMPsXy8ULgi7L328WV1L9Upii07lLMJMcaCIykBzRlOfPmNHvB9yebkQ0JOsbeSQmyicMxkM1HERqwzRtsVWmRIb8As7g05K6rmnZCdIjcCBCiONJYWiPLussGTmyNM3IB3rBLqw76pvIQSr17INeyGSCEoxleZk9d30NOxjE%3D--aL3u0n06BfIK2Yms--4lj2KhNlEdgXgjfGJkRtnA%3D%3D'; // Replace with your cookie data

    const requestBody = JSON.stringify({
        entity_ids: [personId],
        analytics_context: 'Searcher: Individual Add Button',
        skip_fetching_people: true,
        cta_name: 'Access email',
        cacheKey: Date.now(),
    });

    const options = {
        hostname: 'app.apollo.io',
        path: '/api/v1/mixed_people/add_to_my_prospects',
        method: 'POST',
        headers: {
            'accept': '*/*',
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
            'cookie': cookie,
        },
    };

    await randomDelay(); // Wait for a random delay before making the request

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', async () => {
                try {
                    const jsonResponse = JSON.parse(responseData);

                    if (jsonResponse.contacts && jsonResponse.contacts.length > 0) {
                        const contact = jsonResponse.contacts[0];
                        console.log(`Contact Name: ${contact.name}, Email: ${contact.email}`);
                        await insertData(contact);
                        resolve();
                    } else {
                        console.log('No contacts found in the response.');
                        reject(new Error('No contacts found'));
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`Error processing person ID: ${personId}`, error);
            reject(error);
        });

        req.write(requestBody);
        req.end();
    });
}

// Function to process CSV rows sequentially
async function processCsvRowsSequentially(rows) {
    for (let row of rows) {
        const personId = row.ID;
        if (personId) {
            try {
                const exists = await personExists(personId); // Check if person already exists in DB
                if (exists) {
                    console.log(`Person with ID: ${personId} already exists. Skipping...`);
                    continue; // Skip to next person if they already exist
                }

                await processUserId(personId);
            } catch (error) {
                console.error('Stopping further processing due to error:', error);
                break; // Stop further processing if an error occurs
            }
        }
    }
}

// Read the CSV and process each row
const rows = [];
fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        rows.push(row);
    })
    .on('end', async () => {
        console.log('CSV file successfully processed. Starting sequential processing...');
        await processCsvRowsSequentially(rows);
        console.log('Finished processing all rows.');
    });
