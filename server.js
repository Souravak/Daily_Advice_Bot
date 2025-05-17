const fetch = require('node-fetch');
const cron = require('node-cron');
const admin = require('firebase-admin');
const fs = require('fs');

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync('firebase-key.json'))),
});
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