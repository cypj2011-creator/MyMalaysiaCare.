MyMalaysiaCare

Malaysia's smartest recycling companion — an AI-powered web app that helps users identify recyclable items and find nearby recycling centers.
Built for Coolest Projects Malaysia (Web category)

🌏 Live Site
https://cypj2011-creator.github.io/MyMalaysiaCare./

Coded in VSC published in github for more tidy code and publishing.

Features
AI Recycling Scanner (/recycle)
Upload or capture a photo of an item and get instant analysis: category, whether it's recyclable, disposal instructions, and a relevant eco fact. Powered by Google Gemini 2.5 Flash vision API.
We originally experimented with training our own image classification model (~44,000 images) but pivoted to the Gemini API for significantly better accuracy without the overhead of maintaining a custom model.

Interactive map (/map)
Built with Leaflet (open-source, <40kb) showing nearby recycling stations, with a "My Location" button using the browser's Geolocation API.

AI Chat Assistant
A floating chatbot answering questions about recycling and environmental protection, in English, Chinese, and Bahasa Malaysia. Also powered by Gemini 2.5 Flash. Supports voice input via the browser's native Web Speech API.

Multi-language Support
Every page is available in English, Chinese (中文), and Bahasa Malaysia — via a custom-built translation dictionary our team wrote and reviewed by hand (not machine-translated).

Personal Dashboard (/dashboard)
View your scan history, stats (charts via Recharts), and edit your profile.

Leaderboard (/leaderboard)
Ranks users by number of items recycled, encouraging friendly competition.

Learn / FAQ (/learn)
Educational accordion content covering recycling basics, categorized by topic.

🛠️ Tech Stack
Frontend: React + TypeScript, built with Vite
Styling: Tailwind CSS + shadcn/ui
Backend: Supabase (Auth, Database, Edge Functions)
AI: Google Gemini 2.5 Flash (image analysis + chat)
Maps: Leaflet + OpenStreetMap
Charts: Recharts
Speech-to-text: Browser native Web Speech API

The gemini api key is hidden therefore the keys cant be used by other people, key format below.
GEMINI_API_KEY=your_gemini_api_key

Project Structure
src/
  pages/         → Route-level pages (Home, RecycleScanner, Dashboard, etc.)
  components/    → Reusable UI components (Header, Footer, ChatBot, etc.)
  hooks/         → Custom React hooks (useTranslation, etc.)
  translations/  → English/Chinese/Bahasa Malaysia text dictionary
supabase/
  functions/     → Edge functions (analyze-image, chat, transcribe-audio)
  migrations/    → Database schema
Security Notes

Row-Level Security (RLS) policies restrict user data access — users can only view their own profile and scan history, except for the aggregated data intentionally shown on the public leaderboard. 
