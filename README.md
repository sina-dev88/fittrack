# FitTrack 🏋️

**A bilingual fitness and workout tracking platform built with Next.js, TypeScript, Prisma, and Supabase.**

FitTrack is a fitness platform designed to help users plan workouts, track training performance, explore exercises, and monitor their fitness progress. It provides a bilingual interface in English and Persian, with full right-to-left (RTL) layout support.

🌐 **Live Demo:** [https://fittrack-eta-six.vercel.app](https://fittrack-eta-six.vercel.app)

💻 **Source Code:** [GitHub Repository](https://github.com/sina-dev88/fittrack)

> **Project Status:** Actively under development. The core fitness experience is available, while some features are still being improved. The AI Coach section is currently a *Coming Soon* placeholder and does not provide AI-generated coaching.

---

## ✨ Features

### 🏋️ Workout Management
- Create and manage personalized workout plans.
- Generate workout plans based on training preferences.
- Organize training schedules according to workout frequency.
- Track workout sessions, sets, repetitions, and weights.
- Use built-in rest timers and session timers.

### 💪 Exercise Library
- Browse a collection of fitness exercises.
- Explore exercises by muscle groups and equipment.
- View exercise descriptions and instructions.
- Explore muscle anatomy through an interactive anatomy interface.
- Discover exercises targeting specific muscle regions.

### 📊 Progress Tracking
- Monitor workout performance over time.
- Record personal records (PRs).
- Review workout history and completed sessions.
- Analyze training progress and performance.

### 🥗 Fitness & Lifestyle Tools
- Nutrition tracking.
- Sleep tracking.
- Habit tracking.
- Training calendar.
- Achievement system.

### 🌍 Bilingual Experience
- English and Persian language support.
- Full RTL layout support for Persian.
- Localized user interface.

### 🔐 Authentication & User Profiles
- User authentication with Auth.js.
- Personalized user profiles.
- Fitness goals and training preferences.
- Persistent data storage with PostgreSQL.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and application routing |
| TypeScript | Type-safe development |
| React | User interface |
| Tailwind CSS | Styling and responsive design |
| PostgreSQL | Relational database |
| Supabase | Managed PostgreSQL hosting |
| Prisma ORM | Database access and schema management |
| Auth.js / NextAuth | Authentication and session management |
| Git & GitHub | Version control and source code management |
| Vercel | Production deployment and hosting |

---

## 🚀 Live Deployment

FitTrack is deployed on **Vercel** and connected to its GitHub repository.

- **Production:** [Open FitTrack](https://fittrack-eta-six.vercel.app)
- **Source Repository:** [sina-dev88/fittrack](https://github.com/sina-dev88/fittrack)
- **Database:** PostgreSQL hosted on Supabase.

The production application uses a separate database connection configuration suitable for the Vercel serverless environment.

GitHub integration allows new commits pushed to the configured production branch to trigger deployments automatically.

---

## 💻 Getting Started

Follow these instructions to run FitTrack locally.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git
- A PostgreSQL database
- A Supabase project or compatible PostgreSQL instance

### 1. Clone the Repository

```bash
git clone https://github.com/sina-dev88/fittrack.git
cd fittrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local environment file:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Add the required environment variables to your `.env` file.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Open the Application

Navigate to:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

FitTrack requires environment variables for database connectivity and authentication.

Create a `.env` file in the project root and configure the following values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by the application |
| `DIRECT_URL` | Direct or session-pooled PostgreSQL connection used by Prisma CLI |
| `AUTH_SECRET` | Secret key used by Auth.js for authentication and session security |

### Supabase Connection Configuration

The production environment uses Supabase PostgreSQL.

For Vercel deployments:

- `DATABASE_URL`: Supabase Transaction Pooler connection string.
- `DIRECT_URL`: Supabase Session Pooler connection string.
- `AUTH_SECRET`: A securely generated authentication secret.

Never commit actual credentials, database passwords, API keys, or authentication secrets to GitHub.

For production deployments, configure these variables through:

**Vercel → Project Settings → Environment Variables**

---

## 🗄 Database & Prisma

FitTrack uses PostgreSQL with Prisma ORM for database modeling and data access.

The database includes models for:

- Users and authentication.
- User profiles.
- Exercises and exercise preferences.
- Workout plans and training schedules.
- Workout sessions and sets.
- Personal records.
- Nutrition and food entries.
- Sleep tracking.
- Habit tracking.
- Achievements.

Prisma schema and migration files are maintained in the repository.

To inspect the current migration status:

```bash
npx prisma migrate status
```

To generate Prisma Client:

```bash
npx prisma generate
```

> **Important:** Do not run schema-changing commands against the production database without reviewing the migration and backup strategy first.

---

## ☁️ Deployment

FitTrack is deployed using Vercel with GitHub integration.

To deploy your own instance:

1. Fork or clone the GitHub repository.
2. Create a Vercel account.
3. Import the GitHub repository into Vercel.
4. Select Next.js as the framework.
5. Configure the required environment variables.
6. Connect your Supabase PostgreSQL database.
7. Deploy the application.

Once GitHub integration is configured, pushing commits to the production branch can automatically trigger a new deployment.

---

## 🔒 Security Notes

- Never commit `.env` or `.env.local` files.
- Keep database credentials and authentication secrets private.
- Do not expose server-side secrets in client-side code.
- Use environment variables for sensitive configuration.
- Keep database backups before performing production schema changes.
- Use appropriate database connection pooling for serverless deployments.

---

## 🚧 Current Limitations & Future Improvements

FitTrack is an ongoing project. Planned improvements include:

- AI-powered workout recommendations and coaching.
- More advanced training analytics.
- Expanded exercise anatomy and muscle-region coverage.
- Improved exercise descriptions and translations.
- Additional nutrition and lifestyle features.
- Further UI and performance improvements.

**Note:** The AI Coach section is currently a placeholder and is not connected to an AI service.

Some exercise descriptions or localized labels may still fall back to English when a translation is unavailable.

---

## 🤝 Contributing

FitTrack is currently a personal portfolio project.

Suggestions, feedback, and bug reports are welcome through GitHub Issues.

---

## 📄 License

No open-source license has been added to this repository yet.

Until a license is provided, the source code remains subject to the default copyright rules and is not granted an open-source reuse license.