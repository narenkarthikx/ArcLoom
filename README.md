# ArcLoom 🧶

**Weave your days into a masterpiece.**

ArcLoom is a day-centric life tracker designed to focus on *today's* rhythm. Instead of pressuring you with endless streaks and backlogs, it emphasizes daily self-maintenance, consistent rituals, and clearing the mind.
---

## ✨ Core Philosophy

> "Every block is a day you showed up."

ArcLoom moves away from traditional productivity tools that measure *performance*. Instead, it measures *presence*.
*   **Day-Centric**: Every action (Task or Habit) contributes to your "Daily Log."
*   **Clear The Path**: Tasks are meant to be "cleared" from the day, not hoarded.
*   **Gentle Consistency**: The consistency heatmap visualizes your year in a satisfying, pressure-free way.

---

## 🚀 Features

### **🔮 Dashboard**
*   **Year Consistency Heatmap**: A beautiful, GitHub-style contribution graph that visualizes your daily activity intensity.
*   **Live Stats**: Instant view of active rituals, cleared tasks, and activity score.

### **☀️ Rituals (Habits)**
*   **Today's Focus**: Visualizes habits as "Rituals" to be performed today.
*   **Context Aware**: Categorized by Morning, Afternoon, and Evening.
*   **Optimistic UI**: Instant updates as you check off rituals.

### **🌊 Flow (Tasks)**
*   **Energy-Based Sorting**: Organize tasks by energy level (High, Medium, Low) rather than just time.
*   **Clear Goals**: "Clear the day" counter encourages finishing what you started.

### **📅 Calendar & Notes**
*   **Time Blocking**: simple calendar interface for deep work sessions.
*   **Thought Capture**: Minimalist notes for frictionless writing.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite)
*   **Styling**: Tailwind CSS + Framer Motion (for smooth micro-interactions)
*   **Icons**: Lucide React
*   **Backend / DB**: Supabase (PostgreSQL)
*   **State Management**: React Hooks + Optimistic Local State

---

## ⚡ Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   A Supabase Project

### 2. Implementation

Clone the repository:
```bash
git clone https://github.com/narenkarthikx/ArcLoom.git
cd ArcLoom
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Database Schema

Run the provided SQL script in your Supabase SQL Editor to verify the schema:
*   Locate: `supabase_schema.sql`
*   Run the script to create `daily_log`, `habits`, `tasks`, etc.

### 5. Ignite

```bash
npm run dev
```

---

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI Blocks (Heatmap, StatCards)
├── lib/             # API & Supabase Clients
├── pages/           # Core Views (Dashboard, Habits, Tasks)
├── styles/          # Global CSS & Tailind directives
└── App.jsx          # Routing & Layout Root
```

---

