import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import {
  initializeFirestore,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize persistent uploads folder for permanent audio storage
const uploadsAudioDir = path.resolve(__dirname, 'uploads', 'audio');
if (!fs.existsSync(uploadsAudioDir)) {
  fs.mkdirSync(uploadsAudioDir, { recursive: true });
}

// Read firebase applet config for server-side automatic scheduling
let firestoreDb: any = null;
try {
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const serverApp = getApps().length > 0 ? getApps()[0] : initializeApp(config);
    firestoreDb = initializeFirestore(
      serverApp,
      {},
      config.firestoreDatabaseId || '(default)'
    );
    console.log('[VOG Server] Firestore initialized for server-side scheduling.');
  }
} catch (fbInitErr) {
  console.warn('[VOG Server] Notice initializing server-side Firestore:', fbInitErr);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limit for audio voice notes and bulk import batches
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded audio files permanently
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Healthcheck endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const lagosTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());

  res.json({
    status: 'ok',
    service: 'Vessel of Grace Christian Center API',
    timezone: 'Africa/Lagos',
    lagosTime,
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// -------------------------------------------------------------
// AI BIBLE & PRAYER ASSISTANT ROUTE (Server-Side Proxy)
// -------------------------------------------------------------
const AI_SYSTEM_INSTRUCTION = `You are the official VOG Bible & Prayer Assistant for Vessel of Grace Christian Center (VOG), led by Senior Pastor West Somina in Omagwa, Port Harcourt, Rivers State, Nigeria.

Your Purpose:
- Help believers and seekers explore Bible passages, study Christian teachings, and find spiritual nourishment.
- Offer scripture-grounded prayer points and prophetic faith declarations aligned with the grace and dominion message preached at Vessel of Grace Christian Center.
- Reference church themes such as the 10th Anniversary Theme: 'ACCESS' (1 Corinthians 2:9–10: "Eye has not seen, nor ear heard, neither have entered into the heart of man, the things which God hath prepared for them that love him...").

Formatting Guidelines:
- Distinguish direct biblical quotations from your own explanations. Always format biblical scripture verses in distinct Markdown blockquotes:
  > "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God."
  > — Ephesians 2:8 (KJV)
- Keep responses encouraging, well-structured, and respectful. Use clear headings and bullet points for prayer suggestions.

Critical Boundaries:
- You are an AI Bible & Prayer study tool. You are NOT a human pastor or prophet. Never claim to possess spiritual offices or replace personal pastoral counseling.
- For personal pastoral care, marital counseling, home visits, or emergency prayer, always kindly advise the member to submit a prayer request in the VOG app or contact Senior Pastor West Somina and the church intercessory ministry.`;

app.post('/api/ai-assistant', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'A question or prayer prompt is required.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'Gemini AI API key is not configured on the server. Please ensure GEMINI_API_KEY is present in server environment.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history into contents
    const contents: any[] = [];

    // System instruction prompt preface
    contents.push({
      role: 'user',
      parts: [{ text: `[System Instructions for VOG Assistant]:\n${AI_SYSTEM_INSTRUCTION}` }],
    });
    contents.push({
      role: 'model',
      parts: [
        {
          text: 'Understood. I am the VOG Bible & Prayer Assistant for Vessel of Grace Christian Center. I will provide uplifting biblical answers, prayer guidance, and distinguish scripture quotes from explanations while honoring pastoral leadership.',
        },
      ],
    });

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: item.content || item.text || '' }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // Model selection with resilient fallback: gemini-3.8-flash first, fallback to gemini-3.1-flash-lite
    let reply = '';
    let selectedModel = 'gemini-3.8-flash';

    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
      });
      reply = response.text || '';
    } catch (modelError: any) {
      console.warn('Primary model error, attempting gemini-3.1-flash-lite fallback:', modelError?.message);
      selectedModel = 'gemini-3.1-flash-lite';
      const fallbackResponse = await ai.models.generateContent({
        model: selectedModel,
        contents,
      });
      reply = fallbackResponse.text || '';
    }

    if (!reply) {
      reply = 'Grace and peace to you. I received your prayer inquiry. May the Lord grant you revelation and peace according to His Word.';
    }

    res.json({
      reply,
      model: selectedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating AI assistant response:', error);
    res.status(500).json({
      error: error?.message || 'The AI Bible Assistant is temporarily unavailable. Please try again in a moment.',
    });
  }
});

// -------------------------------------------------------------
// AFRICA/LAGOS TIME ZONE SCHEDULING HELPER ROUTE
// -------------------------------------------------------------
app.get('/api/schedule/current-time', (req: Request, res: Response) => {
  const now = new Date();
  const lagosDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // YYYY-MM-DD

  const lagosTimeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now); // HH:MM:SS

  res.json({
    iso: now.toISOString(),
    lagosDate: lagosDateStr,
    lagosTime: lagosTimeStr,
    timezone: 'Africa/Lagos (WAT, UTC+1)',
  });
});

// -------------------------------------------------------------
// VOICE NOTES PERMANENT FILE STORAGE ROUTE
// -------------------------------------------------------------
app.post('/api/voice-notes/upload', async (req: Request, res: Response) => {
  try {
    const { audioBase64, durationSec, mimeType, filename: customName } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Audio data is required.' });
      return;
    }

    // Strip data URL header if present
    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 20 * 1024 * 1024) {
      res.status(400).json({ error: 'Audio file exceeds 20MB limit.' });
      return;
    }

    const ext = mimeType?.includes('mp4') ? 'm4a' : mimeType?.includes('ogg') ? 'ogg' : 'webm';
    const timestamp = Date.now();
    const safeName = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadsAudioDir, safeName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/audio/${safeName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      sizeBytes: buffer.length,
      durationSec: durationSec || 0,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error saving audio voice note:', error);
    res.status(500).json({ error: 'Failed to save voice note on server.' });
  }
});

// -------------------------------------------------------------
// AUTOMATIC PUBLICATION SCHEDULER (Africa/Lagos time)
// -------------------------------------------------------------
async function runAutoPublishCheck(): Promise<{ publishedLifts: number; publishedDevotions: number }> {
  if (!firestoreDb) return { publishedLifts: 0, publishedDevotions: 0 };

  const now = new Date();
  const lagosToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // YYYY-MM-DD

  let publishedLifts = 0;
  let publishedDevotions = 0;

  try {
    // 1. Query scheduled dailyLifts
    const liftsQuery = query(
      collection(firestoreDb, 'dailyLifts'),
      where('status', '==', 'scheduled')
    );
    const liftsSnap = await getDocs(liftsQuery);
    for (const d of liftsSnap.docs) {
      const data = d.data();
      if (data.date && data.date <= lagosToday) {
        await updateDoc(doc(firestoreDb, 'dailyLifts', d.id), {
          status: 'published',
          publishedAt: new Date().toISOString(),
        });
        publishedLifts++;
        console.log(
          `[VOG Auto-Scheduler] Automatically published Daily Lift "${data.title}" for date ${data.date}`
        );
      }
    }

    // 2. Query scheduled dailyDevotions
    const devQuery = query(
      collection(firestoreDb, 'dailyDevotions'),
      where('status', '==', 'scheduled')
    );
    const devSnap = await getDocs(devQuery);
    for (const d of devSnap.docs) {
      const data = d.data();
      if (data.date && data.date <= lagosToday) {
        await updateDoc(doc(firestoreDb, 'dailyDevotions', d.id), {
          status: 'published',
          publishedAt: new Date().toISOString(),
        });
        publishedDevotions++;
        console.log(
          `[VOG Auto-Scheduler] Automatically published Devotional "${data.theme}" for date ${data.date}`
        );
      }
    }
  } catch (err: any) {
    console.warn('[VOG Auto-Scheduler] Scheduled check completed with notice:', err?.message || err);
  }

  return { publishedLifts, publishedDevotions };
}

app.post('/api/schedule/run-auto-publish', async (req: Request, res: Response) => {
  const result = await runAutoPublishCheck();
  res.json({
    status: 'ok',
    ...result,
    totalPublished: result.publishedLifts + result.publishedDevotions,
    checkedAt: new Date().toISOString(),
  });
});

// Run scheduler in background every 60 seconds
setInterval(() => {
  runAutoPublishCheck().catch(() => {});
}, 60000);

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC ASSET MOUNTING
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[VOG Server] Vite development middleware attached.');
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[VOG Server] Serving production static assets from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VOG Server] Vessel of Grace backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[VOG Server] Fatal boot error:', err);
  process.exit(1);
});
