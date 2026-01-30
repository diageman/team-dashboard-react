# Team Dashboard (React Version)

Modern dashboard for tracking team performance with weekly/monthly aggregation.

## Setup & Run

1.  Open terminal in this folder:
    ```bash
    cd team-dashboard-react
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```
4.  Open the link shown in terminal (usually http://localhost:5173).

## Features

-   **Dashboard**: View leaderboards for KPI, Chats, Response Time, and Activities.
    -   Leaders are calculated based on **Monthly Aggregates** of weekly data.
    -   "Premium" sections highlight the top performers with gold styling.
-   **Add Employee**: Enter stats for a specific Week (1-4) and Month.
    -   Data updates automatically if an entry already exists for that week.
-   **Management**: Admin access to delete/edit employees.
    -   Default code: `admin123`

## Deployment

To deploy to Vercel/Netlify:

1.  Push this folder to GitHub.
2.  Import project in Vercel.
3.  Build command: `npm run build`
4.  Output directory: `dist`
