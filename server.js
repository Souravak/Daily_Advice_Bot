const fetch = require('node-fetch');
const cron = require('node-cron');
const admin = require('firebase-admin');
const fs = require('fs');

// Decode and parse your base64-encoded service account key
const firebaseKeyBase64 = "ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiZGFpbHktYWR2aWNlLWJvdCIsCiAgInByaXZhdGVfa2V5X2lkIjogIjQzYzc3ZmM2ZTc2NDg4ODE4ODM5MmVmOGI3YThiN2VjMjY3OThmYjciLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRQzFVQ3lzdWkxY3QyamhcbkpML3JYeVVxblE5OXRTclYzOGlWUTcvcHEyL3NERDNsd24xTHJWRUFZRGRQUWNvb0lkQ1RuZHArckp4RHZPN0Ncbm51c2dKencvMXhib2Jtby9Zak9Sd2QzR0dhNEFjSW16NUp4QTI3cXd3WUxzQ1k1Y2V1emFyV2cxR2lSeXlpMTRcblR1amFML09MaW5GbHlKeTV4dUl2bjhwL0UwNjU3MnorbjVOWFZDRzlzTTJ4WVN0Um1iVTNHYnhWekI5RzF0aTNcbnAzWEs4WlI3NDBialAxNWNHQUVxbXhpMFJ6SG5WVW9DQVVBdG1MYndzNS93dUszU1lVMGpjZE9tVU9KKzhmVUxcbjU2amdPMjNKRjRyTU5TRFVHK283Z3BUVzNXUzUyYU1ENUNaWUp4ZTVGTjRSbUpuUXNMVzNRc0dSNVg1RG0xd1lcblhjVEpIQm1WQWdNQkFBRUNnZ0VBTVpGQURWNStmVHprN3J3SnZiS09xaFl6QUhaUlJoUCtOWlJHZUg2MlE4MWFcbjlKK1ZlbVZnNGgzcnNQNjI0ZjdRa3pLUjQ1U1R5Yzd5WlFGbUhTMnN3blV1WFkrbCt6c0JCeVY5V0NWNEZNV3ZcblY1ODFlbU8zcDQvWGwyakxZd3YyQ1poamh6VGs1djdQckhiQ0lMZ0FPRk02U2cyc2p2dElwYVZsQ2hXQXJjTEpcbmJEbEg2czFMSkY1Z2NBTzE5eHBMZEdCdWx6NUxiTHRXa05LNTArVFI1MEVjTXo2VnN1ZG82cDdrK240SkxXM2hcbjhXZ0s4bVR2NzJCTTMwUjRqaGFVNm9TZWkwZHptNXNMZVZXSnk5dlFqamdWWUdyVHdSVExmMWhwa2doTXRSa2Jcbk02ZkUwRXdkcllLMnZHbHBoTXZDNjhXbnFUUHFUbmM3dXY4eE5NV3J4d0tCZ1FEZHNmQjk3RU1tVFQyM3VIUU5cblFCcmQ0dnJBNHh0U3VPd1hzRnFkbkVWTHFqWXhWR1o1TzFZdHJNZDJ1cEdMWUlzUWhUNFk1am8xZ051YUJPemxcblRWeXZUa1dHWldJbFBubnlNdmlIald2eDhralJVV01xUVAreU9MTHp6ZHJLelR0R1p6U211aVJRVGsyUFZUemFcbkpUSFEvTmM5QXUzYnYrdDhDZDFGNWM1aXV3S0JnUURSWHBQT0RaaFdockpOQ3JUSE5oQXRBNm9Bc0h1Zk9VU2xcbldYRE1vTnVDeDRDajlaV3M4aHFHVENRZ0p0VWNnZGhpNUN6eWwwQXVRazltYVE3MmxidlBOSWkyTit4NTVSN0ZcbmFKY3V2Qllya3F1NU5WRm1ZRm1BUmVsQnRkRXoxWm84T1RIeUkzNjlQOEFSSVF3Z2c3RG9RNTM4V3ZhVm9Md25cblJHdXo5b3QzN3dLQmdRRENpNDcyZ2VsZmFETDcwVU1PQ2E1Si94QjdTaERGSkFBU3ZiQ1hWUFkrY3cwQmR3WkJcbjVyODJiOFBPUGVUUkFaU25sN1dwbGdlSXdoNXo1MVNYMks2NExDQzQwcWt3ODhXQnRCY0NwU2tQOWNUTzR2UDVcbnRYWnRTSEpKbnVFY1RNTnlnY2pqY3IvQk5TVzgzVmo4T2QyZ2Z2REcycFl1M0JsakRTai9XSzRuVndLQmdFUUhcbkJPTllpM3podXlGSkx6L2pFeEp0TkZtUS9qblg4N1ArQWFhYlJYZVN0dnVQR2hqZGVUelZsSTlWenJ5NmU4SjFcbi9SeTloRDhEa0tUbjBkTFJCL3JsU041Y0FWd0IxQ08wUGhzVFJlaldlVEZ1WDRweUYrS1QxSnhqSlJ4QWRTTElcbk9yQkFWRGZOZE95YjNrTGFSeXJRZlk2M1I1T0tiRmdkNVJqT0xMYkZBb0dCQU5iNFJlUmRWMDZEb0V4TjFYcDJcbk9XNkN3ZHA5QlBRL1hnTzdnSS9CaDdiVXlCMVBmY2dhalBCelVvdUtQOVdzeFNlRGFQMDFBeWx6Mmt2QzBQeDFcbkRkdURxbkFCTElkdUEvZGxOd0FEVmkrbzZ0YWcybHU1MHlkT3VzS0ZTRUVXNXY1SW5ocjNjL21PbHFTY2I2Y3ZcbkFxdGcwSkJOZy9lSVFHLzlzQ0tQVHBtc1xuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogImZpcmViYXNlLWFkbWluc2RrLWZic3ZjQGRhaWx5LWFkdmljZS1ib3QuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTAxOTE4OTk0MzI5NDI1NzY3OTg5IiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay1mYnN2YyU0MGRhaWx5LWFkdmljZS1ib3QuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K";

const serviceAccount = JSON.parse(
  Buffer.from(firebaseKeyBase64, 'base64').toString('utf8')
);

// Initialize Firebase Admin with Firestore (no databaseURL needed)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Example: Get Firestore reference
const db = admin.firestore();

// ✅ EmailJS Config
const SERVICE_ID = 'service_r32tjnm';
const TEMPLATE_ID = 'template_c2wrh5p';
const USER_ID = 'RVBqxRqVLRU8lmrsE';

// 📜 Get advice from API
async function getAdvice() {
  const res = await fetch('https://api.adviceslip.com/advice');
  const data = await res.json();
  return data.slip.advice;
}

// 🔥 Get subscriber emails where value === true
async function getSubscriberEmails() {
  const doc = await db.collection('daily_advice_subscribers').doc('subscribers_list').get();
  const data = doc.data();
  if (!data) return [];
  return Object.entries(data)
    .filter(([_, subscribed]) => subscribed === true)
    .map(([email]) => email);
}

async function sendEmail(advice, toEmail) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: USER_ID,
      template_params: {
        advice_text: advice,
        to_email: toEmail,
      },
    }),
  });

  if (res.ok) {
    console.log('✅ Email sent successfully via EmailJS!');
  } else {
    console.error('❌ Failed to send email:', await res.text());
  }
}

// 🕗 Run every day at 8:00 AM
cron.schedule('30 1 * * *', async () => {
  console.log('🕗 Running daily advice email task (7:00 AM IST)...');
  try {
    const advice = await getAdvice();
    const emails = await getSubscriberEmails();
    for (const email of emails) {
      await sendEmail(advice, email);
    }
  } catch (error) {
    console.error('❌ Error in cron job:', error);
  }
});

// ▶️ Run once at startup (optional for testing)
(async () => {
  try {
    const advice = await getAdvice();
    const emails = await getSubscriberEmails();
    for (const email of emails) {
      await sendEmail(advice, email);
    }
  } catch (err) {
    console.error('❌ Error in startup run:', err);
  }
})();