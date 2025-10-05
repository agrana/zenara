# Zenara - Zen Productivity App

A productivity and focus app featuring a Pomodoro timer, task management, AI-powered note processing, and a beautiful markdown scratchpad.

## Features

- 🍅 **Pomodoro Timer** - Stay focused with customizable work/break intervals
- ✅ **Task Management** - Organize and track your tasks
- 📝 **Markdown Scratchpad** - Rich markdown editing with live preview
- 🤖 **AI-Powered Processing** - Process notes with OpenAI (diary, meeting notes, brainstorming)
- 📚 **Note Versioning** - Save and manage multiple versions of your notes
- 🎨 **Beautiful UI** - Glassmorphic design with dark mode support
- 🔐 **Supabase Auth** - Secure authentication

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **State Management**: Zustand
- **UI Components**: Radix UI + shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js >= 18
- A Supabase account
- An OpenAI API key (for AI features)

### Installation

1. **Clone the repository**

```bash
   git clone <your-repo-url>
   cd zenara
```

2. **Install dependencies**

```bash
   npm install
```

3. **Set up environment variables**

```bash
   cp env.example .env
```

Edit `.env` and add your credentials:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key

4. **Run development servers**

   In one terminal (backend):

```bash
npm run dev
```

In another terminal (frontend):

```bash
   npm run dev:client
```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

```bash
   git add .
   git commit -m "Ready for deployment"
   git push
```

2. **Deploy with Vercel CLI**

```bash
   npm i -g vercel
   vercel
```

Or connect your GitHub repo in the Vercel dashboard.

3. **Set environment variables in Vercel**
   - Go to your project settings in Vercel
   - Add all variables from `.env`

### Infrastructure Setup (Optional)

This project includes Terraform configurations for automated infrastructure setup:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

See `/Users/alfonsograna/zenara/terraform/README.md` for details.

## Project Structure

```
zenara/
├── client/              # Vite React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand state management
│   │   └── lib/         # Utilities and configs
│   └── public/          # Static assets (sounds, etc.)
├── server/              # Express backend
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   └── *.ts            # Services and utilities
├── shared/              # Shared types and schemas
└── terraform/           # Infrastructure as code

```

## Available Scripts

- `npm run dev` - Start Express backend (port 3000)
- `npm run dev:client` - Start Vite frontend (port 5173)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run check` - Type check
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Pomodoro

- `GET /api/pomodoro-sessions` - Get sessions
- `POST /api/pomodoro-sessions` - Create session

### Notes

- `POST /api/process-note` - Process note with AI
- `POST /api/process-note-stream` - Stream AI processing
- `GET /api/note-versions/:noteId` - Get note versions

### Prompts

- `GET /api/prompts` - Get all prompts
- `POST /api/prompts` - Create custom prompt
- `GET /api/prompts/templates/types` - Get template types

See `/Users/alfonsograna/zenara/server/routes.ts` for complete API documentation.

## Environment Variables

Required:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key

Optional:

- `PORT` - Server port (default: 3000)
- `OPENAI_MODEL` - AI model (default: gpt-4o-mini)
- `DATABASE_URL` - Direct Postgres connection (if not using Supabase)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT
