const https = require('https');

// Define the options for the POST request
const options = {
  hostname: 'app.apollo.io',
  path: '/api/v1/mixed_people/add_to_my_prospects',
  method: 'POST',
  headers: {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'priority': 'u=1, i',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    "x-csrf-token": "GV3_q8n5KaJ2F33VcdR6_ngqfe4pWpvEGdkMizsJWejDw2yCPz5ir2rzrzxzSpN3IHWGvNQfoxRy1K0XS7zqsA",
    "cookie": "zp__initial_referrer=https://www.google.com/; zp__initial_landing_page=https://www.apollo.io/; zp__utm_source=www.google.com; zp__initial_utm_source=www.google.com; pscd=get.apollo.io; zp__utm_medium=(none); zp__initial_utm_medium=(none); __cf_bm=fs4EEn0zUS.1nb0IQ8QpP9IshKeWGZrHlfPCPQYJmI4-1727226461-1.0.1.1-LJhA_ItYqa47Yf43YFdPMGpNteoHXUf3cvpaKaw7GA.2jIugn7bRuaPZeBf3bqdtfIhPN6vxAWxDgwh0bHtPsA; GCLB=CKeLz-D4lcXwWhAD; remember_token_leadgenie_v2=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqWTJaak0yTTJSaFptUmhaVGM0TURGaU16bGtOVEkzWTE5c1pXRmtaMlZ1YVdWamIyOXJhV1ZvWVhOb0lnPT0iLCJleHAiOiIyMDI0LTEwLTI1VDAxOjE1OjA2Ljk0OVoiLCJwdXIiOiJjb29raWUucmVtZW1iZXJfdG9rZW5fbGVhZGdlbmllX3YyIn19--a0324be19c4a49ab744e5d465ca2e1270c91547e; ZP_LATEST_LOGIN_PRICING_VARIANT=24Q3_W59_100; ZP_Pricing_Split_Test_Variant=24Q3_W59_100; intercom-device-id-dyws6i9m=bc16d816-56f2-4bd7-8f59-cd1d353e4fde; amplitude_id_122a93c7d9753d2fe678deffe8fac4cfapollo.io=eyJkZXZpY2VJZCI6IjA1Yjk4N2ExLTEyZjQtNDM2OS04YWQ3LTMxYjc5MzFjMWZkN1IiLCJ1c2VySWQiOiI2NmYzNjNkYWZkYWU3ODAxYjM5ZDUyN2MiLCJvcHRPdXQiOnRydWUsInNlc3Npb25JZCI6MTcyNzIyNjg2NjAyMiwibGFzdEV2ZW50VGltZSI6MTcyNzIyNjkwNjg4NCwiZXZlbnRJZCI6OCwiaWRlbnRpZnlJZCI6MCwic2VxdWVuY2VOdW1iZXIiOjh9; intercom-session-dyws6i9m=VFRCeE80MytkTFk4Q3pSaWVvLytqNllhQ3h3aDNwamtPUjRDdlN4Z1dHQ0FlZ0QvTVdPYXN5UlArVXBKc3JTNS0tSjlLaUlBNEo1bDRKV0h4ODFheDdFdz09--6d01a9de40c27f8a889dbb9fd2d8832b62224c8b; _dd_s=rum=0&expire=1727227855680; X-CSRF-TOKEN=GV3_q8n5KaJ2F33VcdR6_ngqfe4pWpvEGdkMizsJWejDw2yCPz5ir2rzrzxzSpN3IHWGvNQfoxRy1K0XS7zqsA; _leadgenie_session=ltKhqjDAR%2BJKcdBWMP45tsC0DmN4a%2BEuRB6EQRZJPM92ZKyQUMHToZp%2BbpV6iL0cotIQEbeQL17z6tLtLpDZT0EQ2Su4JFxDEWEbA3sLR6JgFn4zdKOYizjF8NTMPsXy8ULgi7L328WV1L9Upii07lLMJMcaCIykBzRlOfPmNHvB9yebkQ0JOsbeSQmyicMxkM1HERqwzRtsVWmRIb8As7g05K6rmnZCdIjcCBCiONJYWiPLussGTmyNM3IB3rBLqw76pvIQSr17INeyGSCEoxleZk9d30NOxjE%3D--aL3u0n06BfIK2Yms--4lj2KhNlEdgXgjfGJkRtnA%3D%3D",
    "Referer": "https://app.apollo.io/",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Define the data to send in the body of the POST request
const data = JSON.stringify({
  entity_ids: ["6314fe8683fcf20001defea4"],
  analytics_context: "Searcher: Individual Add Button",
  skip_fetching_people: true,
  cta_name: "Access email",
  cacheKey: 1727225272674
});

// Create the POST request
const req = https.request(options, res => {
  let responseData = '';

  // Collect response data
  res.on('data', chunk => {
    responseData += chunk;
  });

  // When the response ends, parse and log the response
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseData);

      // Extract the email of the contact and log it
      if (jsonResponse.contacts && jsonResponse.contacts.length > 0) {
        jsonResponse.contacts.forEach(contact => {
          console.log(`Contact Name: ${contact.name}, Email: ${contact.email}`);
        });
      } else {
        console.log('No contacts found in the response.');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
});

// Handle errors
req.on('error', error => {
  console.error('Request error:', error);
});

// Send the request with the data
req.write(data);
req.end();



