# ArcLoom 🧶

**ArcLoom** is a unified personal productivity platform that weaves together your calendar, tasks, habits, and notes into a single, beautiful interface.

## Features

- **📊 Dashboard**: At-a-glance view of your day, priority tasks, and habit streaks.
- **📅 Calendar**: Scheduler to manage your events and meetings.
- **✅ Tasks**: Task manager with smart prioritization and due dates.
- **🔥 Habits**: Track your daily habits with heatmap visualization (GitHub style).
- **📝 Notes**: Clean, distraction-free notes editor.
- **🔐 Secure**: Full authentication powered by Supabase.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth)
- **Icons**: Lucide React

## Setup Guide

### 1. Prerequisites
- Node.js installed
- A Supabase account

### 2. Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/narenkarthikx/ArcLoom.git
cd ArcLoom
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Database Setup

1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Open the `supabase_schema.sql` file located in this project.
3. Copy the entire content and paste it into the SQL Editor.
4. Click **Run** to create all tables (`tasks`, `habits`, `habit_logs`, `notes`, `events`) and RLS policies.

### 5. Run the App

```bash
npm run dev
```

Open your browser to the local URL (usually `http://localhost:5173`).

## License

MIT
