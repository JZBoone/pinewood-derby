# Pinewood Derby

This repository contains all of the code for the Pack 272 Pinewood Derby. It includes the C++ code that runs on the Arduino, a Node.js script that connects to the Arduino and sends scores to the website, and a Next.js app that manages derbies, cars, and heats and makes this information available via https://pinewood-derby.vercel.app/

## Deployment & Database Architecture

This application is deployed on Vercel's free tier, utilizing automated CI/CD where pushes to the main branch trigger deployments in Vercel. The data persistence layer is powered by a Supabase PostgreSQL database (free tier).

The application should connect to Supabase using Transaction Mode (port 6543) rather than the standard Session Mode. This configuration is needed for Vercel's serverless environment, as it uses a connection pooler (Supavisor) to multiplex many ephemeral serverless function instances onto a small number of actual database connections. This prevents "max client" exhaustion errors. We should also append `?pgbouncer=true` to the `DATABASE_URL` environment variable so that Prisma knows not to use prepared statements which don't work with Supavisor multiplexing.

## Getting Started

### Prerequisites

-   **Node.js**: Install the version specified in `.nvmrc`.
-   **Docker**: Required for running the local Postgres database.

### Local Development

This project uses a `Makefile` to simplify common development tasks. Run `make` to see a full list of available commands with descriptions.

-   **Start the App**: Run `make run` to spin up the local database, apply migrations, and start the Next.js dev server.
-   **Race Interface**: Run `make race` to connect to the Arduino and send race times to the website.

### Testing Strategy

Currently, tests are run locally and not in CI.

-   **Run Tests**: Execute `make test` to spin up a dedicated test database and run the suite.
-   **Run Individual Test**: Use `make <path/to/file.test.ts>` to run a specific test file.

## How the Website Works

### 1. Derby Setup & Administration

Some administrative actions do not yet have a UI and are performed via API calls using Postman.

-   **Importing Racers**: Once sign-ups are complete, download the CSV and `POST` it to `{{baseUrl}}/api/derby/csv?derby_id=X`.
-   **Postman Collection**: [`pinewood-derby.postman_collection.json`](./pinewood-derby.postman_collection.json). Ideally we make UI for all the things.

### 2. Running Heats & The "Secret" Interface

During the event, the website is displayed on a projector for the audience.

-   **Activating a Heat**: To set a heat as "Active" **Hold `Shift` + Click the Heat Number** on the heats list page.
    -   *Note*: This relies on security-by-obscurity (users generally don't know this trick and are on mobile devices), as there is no formal authentication.
-   **Updating Scores**: Calling `POST {{baseUrl}}/api/heat` updates the times for the currently active heat.
-   **Re-running Heats**: You can overwrite times by posting scores to a heat that has been activated and already has times. Sometimes this is desirable if you want to re-run a heat. **Warning**: Ensure the correct heat is active before posting times, or you risk overwriting valid scores. The Arduino prints the times to the serial output. If you inadvertently overwrite a heat's times then you can look at the Arduino output, activate the heat again, and call `POST {{baseUrl}}/api/heat` with the overwritten times.

### 3. Heat Generation Logic

The system generates heats to ensure fairness:

-   **Lane Rotation**: A heat has a maximum of 6 cars (matching the 6-lane track).
-   **Splitting Dens**: If a den has 7 cars (more than one heat's worth), they are split evenly (e.g., groups of 4 and 3).
-   **Neighbor Avoidance**: The algorithm ensures a car never has the same two neighbors to prevent mechanical issues (like a neighbor's wheel falling off) from consistently affecting the same racer.

### 4. Late Entries & Ad-Hoc Racers

If siblings or late-comers want to participate after the derby has started:

1.  Group them into a "catch-all" Den (e.g., Den 67).
2.  Add the car via API: `POST {{baseUrl}}/api/car` (requires the Den's Database ID).
3.  Regenerate the schedule: `POST {{baseUrl}}/api/den/heat/regenerate`.

### 5. Championship Round

Once all standard heats are finished:

1.  Go to the homepage.
2.  Unhide the "Make Championship" button (it has `display: none;` style by default).
3.  Clicking it triggers `POST {{baseUrl}}/api/derby/championship`.

**Logic**: This calculates the winner (best time) from each Den and generates new heats specifically for those winners.

## Database Dumps

To dump the database schema from supabase run:
`npx supabase db dump --db-url "CONNECTION_STRING" -f db-schema-backup.sql`

To dump the data from the database run:
`npx supabase db dump --db-url "CONNECTION_STRING" -f db-data-backup.sql --use-copy --data-only`