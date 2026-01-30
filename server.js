

//  2nd


const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
// Render assigns a port automatically via process.env.PORT
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ==================================================================
// CONFIGURATION
// In production (Render), these come from Environment Variables.
// In local, they fall back to strings (if you hardcode them for testing).
// ==================================================================
const EMAIL_USER = process.env.EMAIL_USER || 'YOUR_EMAIL@gmail.com'; 
const EMAIL_PASS = process.env.EMAIL_PASS || 'YOUR_APP_PASSWORD';     

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const PATTERNS = {
  DANGER: [
    /\bhelp\b/i, /\bdanger\b/i, /\bemergency\b/i, /\bsos\b/i,
    /\bhelp me\b/i, /\bneed help\b/i, /\bin danger\b/i, /\bcall 911\b/i,
    /\bkill\b/i, /\bsuicide\b/i, /\bdie\b/i, /\bhurt myself\b/i, 
    /\bend it all\b/i, /\bself-harm\b/i, /\bno point\b/i, /\bharm\b/i
  ],
  CONCERNING: [
    /\bsad\b/i, /\blonely\b/i, /\bdepressed\b/i, /\bangry\b/i, 
    /\banxious\b/i, /\bfear\b/i, /\bcrying\b/i, /\bhate\b/i, /\bworthless\b/i,
    /\btired\b/i, /\bpain\b/i, /\bnot feeling good\b/i
  ]
};

app.get('/', (req, res) => {
  res.send('SentientGuardian Backend is Running.');
});

app.post('/analyze', async (req, res) => {
  const { text, user, location } = req.body;
  
  console.log(`\n[Analyzing] "${text}"`);
  
  if (!text) return res.status(400).json({ error: 'No text' });

  let result = {
    emotion: "Neutral / Unclear",
    intensity: 3,
    statusSummary: "Standard emotional check-in.",
    safetyLevel: "SAFE",
    recommendation: "Keep journaling.",
    emailSent: false
  };

  const t = text.toLowerCase();

  if (PATTERNS.DANGER.some(regex => regex.test(t))) {
    console.log(" -> MATCH: DANGER detected.");
    result = {
      emotion: "CRITICAL / DANGER",
      intensity: 10,
      statusSummary: `Risk Detected in text: "${text}"`,
      safetyLevel: "DANGER",
      recommendation: "Emergency protocols activated."
    };
  } else if (PATTERNS.CONCERNING.some(regex => regex.test(t))) {
    console.log(" -> MATCH: CONCERNING detected.");
    result = {
      emotion: "Distress",
      intensity: 7,
      statusSummary: "High emotional weight detected.",
      safetyLevel: "CONCERNING",
      recommendation: "Wellness check advised."
    };
  } else if (/\bhappy\b|\bgood\b|\bjoy\b|\bfine\b/i.test(t)) {
    result = {
      emotion: "Positive",
      intensity: 4,
      statusSummary: "You sound stable.",
      safetyLevel: "SAFE",
      recommendation: "Keep it up."
    };
  }

  if ((result.safetyLevel === 'DANGER' || result.safetyLevel === 'CONCERNING') && user && user.contacts) {
    
    if (!EMAIL_USER || EMAIL_USER.includes('YOUR_EMAIL')) {
       console.log(" [!] Skipping email: Credentials not set.");
       result.emailError = true;
       return res.json(result);
    }

    const isUrgent = result.safetyLevel === 'DANGER';
    const subject = isUrgent 
      ? `🚨 SOS ALERT: ${user.name} needs help!` 
      : `Wellness Update: ${user.name} might need a friend`;
    
    const contacts = user.contacts.map(c => c.email);

    if (contacts.length > 0) {
      const mailOptions = {
        from: `"SentientGuardian AI" <${EMAIL_USER}>`,
        to: contacts.join(', '),
        subject: subject,
        text: `
          AUTOMATED SAFETY ALERT
          
          User: ${user.name}
          Status: ${result.safetyLevel}
          Detected Emotion: ${result.emotion}
          
          Context/Transcript: "${text}"
          
          Location Detected: ${location || 'Not provided'}
          
          Please check on them immediately.
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(` [✓] Email sent successfully.`);
        result.emailSent = true;
      } catch (error) {
        console.error(" [X] Email failed to send:", error.message);
        result.emailError = true;
      }
    }
  }

  res.json(result);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
