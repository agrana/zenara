// Vercel serverless function entry point
// Wraps Express routes for serverless execution
import express, { Request, Response } from 'express';
import 'dotenv/config';

// Import route handlers from server
import { storage } from '../server/storage';
import { ProcessingService } from '../server/processingService';
import { PromptService } from '../server/promptService';
import { NoteVersionService } from '../server/noteVersionService';
import OpenAI from 'openai';
import { z } from 'zod';
import type { InsertTask, InsertPomodoroSession, InsertScratchpad, InsertSettings } from '../shared/schema';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    supabase: !!process.env.SUPABASE_URL,
    openai: !!process.env.OPENAI_API_KEY
  });
});

// Export for Vercel serverless
export default app;

