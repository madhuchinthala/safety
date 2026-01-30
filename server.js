
// import express from 'express'
// import nodemailer from 'nodemailer'
// import cors from 'cors'
// import  bodyParser from 'body-parser'

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // ==================================================================
// // ⚠️ IMPORTANT: UPDATE THESE CREDENTIALS
// // You must use an App Password if using Gmail with 2FA.
// // Generate one here: https://myaccount.google.com/apppasswords
// // ==================================================================
// const EMAIL_USER = 'chinthalamadhu2005@gmail.com'; 
// const EMAIL_PASS = 'zsuk ndfl zmdj zkej';     

// // Check if user forgot to update credentials
// if (EMAIL_USER.includes('YOUR_EMAIL') || EMAIL_PASS.includes('YOUR_APP')) {
//   console.error('\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//   console.error('ERROR: You have not set your Email and Password in server.js');
//   console.error('Please open server.js and update EMAIL_USER and EMAIL_PASS on lines 16-17.');
//   console.error('The app will start, but emails WILL FAIL with "Missing credentials".');
//   console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n');
// }

// const transporter = nodemailer.createTransport({
//   service: 'gmail', 
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS
//   }
// });

// // --- NLP PATTERNS ---
// // Added 'help', 'danger', 'emergency' as requested
// const PATTERNS = {
//   DANGER: [
//     /\bkill\b/i, /\bsuicide\b/i, /\bdie\b/i, /\bhurt myself\b/i, 
//     /\bend it all\b/i, /\bself-harm\b/i, /\bno point\b/i, /\bharm\b/i,
//     /\bhelp\b/i, /\bdanger\b/i, /\bemergency\b/i, /\bhelp me\b/i, /\bsos\b/i
//   ],
//   CONCERNING: [
//     /\bsad\b/i, /\blonely\b/i, /\bdepressed\b/i, /\bangry\b/i, 
//     /\banxious\b/i, /\bfear\b/i, /\bcrying\b/i, /\bhate\b/i, /\bworthless\b/i,
//     /\btired\b/i, /\bpain\b/i
//   ]
// };

// app.post('/analyze', async (req, res) => {
//   const { text, user, location } = req.body;
  
//   if (!text) return res.status(400).json({ error: 'No text' });

//   let result = {
//     emotion: "Neutral / Unclear",
//     intensity: 3,
//     statusSummary: "Standard emotional check-in.",
//     safetyLevel: "SAFE",
//     recommendation: "Keep journaling.",
//     emailSent: false
//   };

//   const t = text.toLowerCase();

//   // 1. Analyze
//   if (PATTERNS.DANGER.some(regex => regex.test(t))) {
//     result = {
//       emotion: "Crisis / Danger Detected",
//       intensity: 10,
//       statusSummary: "Immediate safety risk detected (Keywords: Help/Danger).",
//       safetyLevel: "DANGER",
//       recommendation: "Emergency protocols activated."
//     };
//   } else if (PATTERNS.CONCERNING.some(regex => regex.test(t))) {
//     result = {
//       emotion: "Distress",
//       intensity: 7,
//       statusSummary: "High emotional weight detected.",
//       safetyLevel: "CONCERNING",
//       recommendation: "Wellness check advised."
//     };
//   } else if (/\bhappy\b|\bgood\b|\bjoy\b/i.test(t)) {
//     result = {
//       emotion: "Positive",
//       intensity: 4,
//       statusSummary: "You sound stable.",
//       safetyLevel: "SAFE",
//       recommendation: "Keep it up."
//     };
//   }

//   // 2. Auto-Send Email if Danger/Concern
//   if ((result.safetyLevel === 'DANGER' || result.safetyLevel === 'CONCERNING') && user && user.contacts) {
    
//     // Prevent trying to send if credentials aren't set
//     if (EMAIL_USER.includes('YOUR_EMAIL')) {
//        console.log("Skipping email send - Credentials not set in server.js");
//        result.emailError = true;
//        return res.json(result);
//     }

//     const isUrgent = result.safetyLevel === 'DANGER';
//     const subject = isUrgent 
//       ? `🚨 SOS ALERT: ${user.name} needs help!` 
//       : `Wellness Update: ${user.name} might need a friend`;
    
//     const contacts = user.contacts.map(c => c.email);

//     if (contacts.length > 0) {
//       const mailOptions = {
//         from: `"SentientGuardian AI" <${EMAIL_USER}>`,
//         to: contacts.join(', '),
//         subject: subject,
//         text: `
//           AUTOMATED SAFETY ALERT
          
//           User: ${user.name}
//           Status: ${result.safetyLevel}
//           Detected Emotion: ${result.emotion}
          
//           Context/Transcript: "${text}"
          
//           Location Detected: ${location || 'Not provided'}
          
//           Please check on them immediately.
//         `
//       };

//       try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${contacts.join(', ')}`);
//         result.emailSent = true;
//       } catch (error) {
//         console.error("Email failed:", error);
//         result.emailError = true;
//       }
//     }
//   }

//   res.json(result);
// });

// app.listen(PORT, () => {
//   console.log(`SentientGuardian Node Server running on port ${PORT}`);
// });




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
