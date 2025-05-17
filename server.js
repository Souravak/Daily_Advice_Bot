const fetch = require('node-fetch');
const cron = require('node-cron');

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

// 📧 Send email via EmailJS
async function sendEmail(advice) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: USER_ID,
      template_params: {
        advice_text: advice,
        to_email: 'souravak211@gmail.com',
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
cron.schedule('0 8 * * *', async () => {
  console.log('🕗 Running daily advice email task...');
  try {
    const advice = await getAdvice();
    await sendEmail(advice);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// Run immediately once on start (optional)
(async () => {
  const advice = await getAdvice();
  await sendEmail(advice);
})();