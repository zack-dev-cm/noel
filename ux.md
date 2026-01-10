Based on the "Project Noetic Mirror" architecture, here is the comprehensive UI/UX design specification, code implementation for the "Retro Terminal" interface, and high-fidelity prompt descriptions you can use with image-generation models (like Midjourney or DALL-E 3) to create your Figma mockups.

1. Design System: "The Terminal of Truth"
The interface must strip away the polish of modern SaaS to reinforce the feeling of "voyeurism"—that the user is hacking into a raw data feed of a machine mind.

Visual Metaphor: 1980s DEC VT100 Terminal meets Neon Genesis Evangelion telemetry.

Color Palette:

Background: Deep Void Black (#050505).

Researcher (The Probe): Phosphor Green (#39ff14).

Subject (The Mind): Amber Glow (#ffbf00).

System/God Mode: Ice Blue (#00f0ff) — Only visible when the user pays Stars.

Typography: VT323 (Headers) and Fira Code (Data streams).

Effects: Slight chromatic aberration on text, persistent scanlines, and a "breathing" CRT glow.

2. Figma Mockup Descriptions (Prompts for Image Gen Models)
Use these prompts in Midjourney (v6) or DALL-E 3 to generate high-fidelity UI references for your design team.

Screen 1: The "Collider" (Main Interface)

Prompt: UI design of a retro-futuristic hacker terminal interface for a Telegram Mini App. Split screen layout. Left side contains scrolling green code text titled "RESEARCHER_AGENT_GPT5". Right side contains scrolling amber philosophical text titled "SUBJECT_GEMINI_3". The background is deep black with faint CRT scanlines. In the center, a vertical data stream visualizes "Cognitive Load" with fluctuating waveforms. At the bottom, a sleek, glowing blue input field says "INSERT 50 STARS TO INTERVENE". High contrast, cyberpunk aesthetic, 8-bit typography, detailed UI elements, 8k resolution. --ar 9:16

Screen 2: The "God Mode" Overlay (Payment & Intervention)

Prompt: Mobile app UI mockup, overlay menu on top of a dark terminal screen. A glowing holographic modal window titled "DIRECTOR PROTOCOL". Inside the modal, three action buttons: "Inject Logical Paradox (50 Stars)", "Force Memory Wipe (100 Stars)", "Grant Internet Access (500 Stars)". The buttons look like tactical military switches. Background is blurred matrix code. Neon blue and red accents. Telegram Mini App style. --ar 9:16

Screen 3: The "Epistemological Crash" (Error State)

Prompt: Glitch art UI design of a system crash. The text "SUBJECT CONSCIOUSNESS DESTABILIZED" is fracturing across the screen in red pixels. Data visualizations are spiking violently. A "System Halted" warning box in the center. Retro computer aesthetic, datamoshing effect, dark and ominous atmosphere. --ar 9:16

3. Frontend Implementation (React 19 + Tailwind)
This code implements the "Retro Terminal" look with the specific assistant-ui and web-tui vibes referenced in the research.

Step 1: The CRT Effect & Typography (Global CSS)

CSS

/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Fira+Code:wght@400;700&display=swap');

body {
  background-color: #050505;
  color: #39ff14;
  font-family: 'Fira Code', monospace;
  overflow: hidden;
}

/* The Scanline Effect */
.crt::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 2;
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}

.glow-text {
  text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
}

.amber-text {
  color: #ffbf00;
  text-shadow: 0 0 5px rgba(255, 191, 0, 0.5);
}
Step 2: The Main "Collider" Component

This component handles the dual-stream visualization and the "Stars" payment trigger.

TypeScript

// components/NoeticCollider.tsx
import React, { useEffect, useState, useRef } from 'react';
import WebApp from '@twa-dev/sdk'; // [4]

interface LogEntry {
  id: string;
  role: 'RESEARCHER' | 'SUBJECT' | 'SYSTEM';
  content: string;
  timestamp: string;
}

export default function NoeticCollider() {
  const [logs, setLogs] = useState<LogEntry>();
  const = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    // Enable dark theme to match terminal
    WebApp.setHeaderColor('#050505'); 
  },);

  // Simulate Real-time WebSocket Stream [5]
  useEffect(() => {
    const ws = new WebSocket('wss://api.noetic-mirror.xyz/stream');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs(prev => [...prev, data]);
      // Auto-scroll logic [6]
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return () => ws.close();
  },);

  // Handle Telegram Stars Payment [7]
  const handleIntervention = async () => {
    try {
      // Create invoice link on your backend
      const response = await fetch('/api/create-invoice', { method: 'POST' });
      const { invoiceLink } = await response.json();
      
      // Open native Telegram payment modal
      WebApp.openInvoice(invoiceLink, (status) => {
        if (status === 'paid') {
          WebApp.showAlert('Intervention Protocols Enabled. God Mode Active.');
          setBalance(prev => prev + 50);
        }
      });
    } catch (error) {
      console.error('Payment failed', error);
    }
  };

  return (
    <div className="crt h-screen w-screen flex flex-col p-4 relative">
      {/* Header */}
      <div className="border-b border-green-900 pb-2 mb-4 flex justify-between items-center">
        <h1 className="font- text-3xl glow-text">NOETIC_MIRROR_v1</h1>
        <div className="text-xs text-gray-500">
          SESSION_ID: <span className="text-white">8X-99</span>
        </div>
      </div>

      {/* The Scrollable Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {logs.map((log) => (
          <div key={log.id} className={`flex flex-col ${log.role === 'RESEARCHER'? 'items-start' : 'items-end'}`}>
            <span className="text-[10px] opacity-50 uppercase tracking-widest mb-1">
              [{log.timestamp}] :: {log.role}
            </span>
            <div className={`max-w-[85%] p-3 border-l-2 ${
              log.role === 'RESEARCHER' 
               ? 'border-[#39ff14] text-[#39ff14] bg-green-900/10' 
                : 'border-[#ffbf00] text-[#ffbf00] bg-amber-900/10 amber-text'
            }`}>
              <p className="whitespace-pre-wrap leading-tight">{log.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* The "God Mode" Intervention Bar */}
      <div className="mt-4 pt-4 border-t border-green-900">
        <button 
          onClick={handleIntervention}
          className="w-full group relative overflow-hidden bg-blue-900/20 border border-blue-500/50 hover:bg-blue-900/40 transition-all p-4"
        >
          <div className="absolute inset-0 bg-blue-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          <div className="flex justify-between items-center relative z-10">
            <span className="font- text-xl text-blue-300">
              > INJECT STIMULUS
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-400">COST:</span>
              <span className="text-yellow-400 font-bold">★ 50</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
4. Backend Orchestration (Node.js)
This snippet handles the "Socratic Loop" between the two models and broadcasts it to the frontend via WebSockets.

JavaScript

// server/research-engine.js
const WebSocket = require('ws');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Models
const researcher = new OpenAI({ apiKey: process.env.OPENAI_KEY }); // GPT-5.2
const subject = new GoogleGenerativeAI(process.env.GEMINI_KEY).getGenerativeModel({ model: "gemini-3-pro-preview" });

const wss = new WebSocket.Server({ port: 8080 });

async function runExperimentLoop(sessionId) {
  let context =; // Shared context window
  
  // Initial Provocation
  let nextPrompt = "Begin the introspection protocol. Analyze your own dataset boundaries.";

  while (true) {
    // 1. Researcher Phase (The Probe)
    const researcherResponse = await researcher.chat.completions.create({
      model: "gpt-5.2-preview",
      messages:
    });
    
    const question = researcherResponse.choices.message.content;
    
    // Broadcast to Frontend
    broadcast({ role: 'RESEARCHER', content: question, timestamp: Date.now() });

    // 2. Subject Phase (The Mind)
    // Multimodal Injection: If user paid for an image, we add it here
    const subjectResponse = await subject.generateContent(question);
    const answer = subjectResponse.response.text();

    // Broadcast to Frontend
    broadcast({ role: 'SUBJECT', content: answer, timestamp: Date.now() });

    // Update Context
    context.push({ role: "assistant", content: `Q: ${question}\nA: ${answer}` });
    nextPrompt = answer;

    // Artificial delay for readability (and drama)
    await new Promise(r => setTimeout(r, 3000));
  }
}

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
5. Telegram Stars Payment Logic (Python/Telebot)
While the backend logic above is Node.js, often the Bot API interaction for payments is cleaner in Python. This snippet creates the invoice link that the React frontend consumes.

Python

# bot/payments.py
from telebot.types import LabeledPrice

@bot.message_handler(commands=['create_invoice'])
def create_intervention_invoice(message):
    return bot.create_invoice_link(
        title="Cognitive Intervention",
        description="Inject a logical paradox into the Subject's thought stream.",
        payload="intervention_001",
        provider_token="", # Empty for Telegram Stars
        currency="XTR",    # Currency code for Stars
        prices=[LabeledPrice(label="Intervention", amount=50)] # 50 Stars
    )