# Hifz Tracker

A React Native Expo app for tracking Quran memorization (Hifz) progress for students and teachers.

## Features

- **Teacher Dashboard**: Manage students, track their progress, and create lessons
- **Student Dashboard**: Track personal progress, create peer revision sessions
- **Mistake Tracking**: Record and track mistakes during lessons and peer revisions
- **Session Management**: Create and manage peer revision sessions and teacher-led lessons
- **Progress Tracking**: Monitor which Surah/Ayah students are currently on

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase (for authentication and database)
- React Navigation
- React Query

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/HifzTracker.git
cd HifzTracker
```

2. Install dependencies

```bash
npm install
```

3. Set up Supabase MCP Server

The project uses Cursor's Managed Connection Pool (MCP) for Supabase. This gives you a local development environment that connects to your Supabase project.

Start the MCP server in a terminal:

```bash
npx @supabase/mcp-server-supabase --access-token sbp_7aec6c548bcab9219b008888f7249ea71c97fff5
```

4. Start the Expo development server

In a new terminal window:

```bash
cd HifzTracker
npm start
```

## Project Structure

```
src/
├── api/              # API services
├── components/       # Reusable components
├── hooks/            # Custom hooks
├── navigation/       # Navigation configuration
├── screens/          # Screen components
│   ├── shared/       # Screens used by both teachers and students
│   ├── student/      # Student-specific screens
│   └── teacher/      # Teacher-specific screens
├── store/            # Global state management
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Database Schema

The app uses the following main tables:

- **users**: For authentication and user management
- **students**: Contains student-specific information
- **teacher_students**: Links teachers with their students
- **sessions**: For peer revision sessions
- **mistakes**: Records mistakes during peer revision
- **lessons**: For teacher-led lessons
- **lesson_mistakes**: Records mistakes during lessons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 