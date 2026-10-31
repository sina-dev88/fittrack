# FitTrack

**A bilingual fitness and workout tracking platform built with Next.js.**

FitTrack helps users organize their training, record workout performance, explore exercises, and review progress in one place. The interface supports English and Persian, including right-to-left layouts.

> **Project status:** The core fitness experience is under active development. The AI Coach section is currently a *Coming Soon* placeholder and does not provide AI-generated coaching yet.

## Features

- **Workout planning:** Create and manage training plans and generate plans based on training preferences.
- **Workout sessions:** Track sets, weight, repetitions, and training effort, with session and rest timers.
- **Exercise library:** Browse exercises and review their primary muscle groups and equipment.
- **Anatomy explorer:** Explore muscle groups and related exercises through an interactive anatomy interface.
- **Progress tracking:** Review training progress and personal records.
- **Workout history:** Revisit completed training sessions and their recorded performance.
- **Fitness tools:** Dedicated areas for calendar, nutrition, sleep, habits, and achievements.
- **Bilingual interface:** English and Persian UI with RTL support for Persian.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** React and Tailwind CSS
- **Database:** PostgreSQL hosted on Supabase
- **ORM:** Prisma
- **Authentication:** Auth.js / NextAuth integration
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js version compatible with the project's Next.js version
- npm
- A PostgreSQL database
- The environment variables required by the application (see `.env.example`)

### Installation

1. Clone the repository:

   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd fittrack
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Add your own database and authentication values to `.env`. Never commit `.env` or paste production secrets into issues, screenshots, or public chats.

5. Generate the Prisma Client if it is not generated automatically by the install/build scripts:

   ```bash
   npx prisma generate
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

> **Database note:** Use the database setup and migration workflow defined by this repository. Do not run schema-changing commands against a production database until the deployment database and migration strategy have been checked.

## Environment Variables

Copy `.env.example` to `.env` and provide the values required by the application. The exact variable names should match the project's Prisma and authentication configuration.

For deployment, add the same required keys in **Vercel → Project → Settings → Environment Variables**. Use separate values for Production and Preview where appropriate. Do not put secret values in this README or in the Git repository.

## Deployment

FitTrack is designed to be deployed to Vercel.

1. Push the project to a GitHub repository.
2. In Vercel, create a new project and import that GitHub repository.
3. Select the project root directory and the Next.js framework preset.
4. Add the required environment variables in the Vercel project settings.
5. Deploy and verify authentication, database access, and the main workout flows on the production URL.

After Git integration is enabled, pushes to the configured production branch can trigger production deployments; other branches can be used for preview deployments.

## Security Notes

- `.env`, `.env.local`, and other files containing credentials must stay out of version control.
- Never expose database passwords, authentication secrets, OAuth client secrets, or private API keys in client-side code.
- Use a pooled PostgreSQL connection appropriate for serverless deployment and confirm the Prisma connection configuration before going live.
- Use a separate Preview database when testing schema changes, so preview deployments cannot unexpectedly affect production data.

## Current Limitations

- AI Coach is a placeholder page and is not connected to an AI service yet.
- Some exercise descriptions and localized labels may still fall back to English when a translation is not available.

## Contributing

This is currently a personal portfolio project. Suggestions and bug reports are welcome through GitHub Issues.

## License

No license has been added yet. Unless a license is added to this repository, the source code is not granted an open-source reuse license.
