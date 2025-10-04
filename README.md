# 🌱 Mini-SPADE: A Full-Stack Patent Search POC

This project is a high-fidelity, full-stack proof-of-concept (POC) inspired by Garden Intelligence's SPADE platform. It's designed to showcase modern web development practices, a deep understanding of product requirements, and the ability to build a robust, database-driven application from the ground up.

The application is a powerful patent search tool that allows users to query a database of patents using keywords, inventors, and publication dates, with a UI/UX inspired by Garden Intelligence's own branding.

## ✨ Core Features

*   **Dynamic, Real-time Search**: A sophisticated search interface that queries a live database.
*   **Advanced Filtering**: Users can narrow down results by publication date range and inventor names.
*   **Partial & Case-Insensitive Search**: Inventor search is user-friendly, allowing for partial name matches (e.g., "Adi" finds "Adi Sidapara").
*   **AI-Powered Similarity (Mock)**: A "Find Similar" feature that simulates an AI algorithm by finding patents with overlapping keywords in their abstracts.
*   **Pagination**: Efficiently handles large result sets by paginating results, ensuring a fast and smooth user experience.
*   **Dedicated Detail Pages**: Each patent has a unique, shareable URL and a dedicated page displaying comprehensive details like assignee, legal status, claims, and classifications.
*   **URL State Management**: All search and filter states are synced with the URL, allowing users to bookmark and share their exact search queries.

## 🚀 Live Demo

*(TODO)*

## 🛠️ Tech Stack & Architecture

This project is built with a modern, type-safe, full-stack architecture.

*   **Framework**: [Next.js](https://nextjs.org/) (React)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/))
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Styling**: [CSS Modules](https://github.com/css-modules/css-modules) (with a dark theme inspired by the Garden Intelligence website)
*   **Deployment**: Vercel (planned)

## 🌟 Advanced Concepts Implemented

This POC demonstrates several advanced engineering concepts that are crucial for building production-ready applications:

*   **Database-Driven Backend**: The entire application is powered by a real PostgreSQL database, not static mock files.
*   **Custom React Hooks**: The complex search and state management logic is encapsulated in a reusable `usePatentSearch` hook, keeping the UI components clean and maintainable.
*   **Debouncing**: User input is debounced to prevent excessive API calls during rapid typing, optimizing performance and user experience.
*   **Optimistic UI with Skeletons**: On data fetch, the UI displays loading skeletons, improving the perceived performance and providing a smoother user experience.
*   **Server-Side Rendering (SSR)**: Patent detail pages are rendered on the server (`getServerSideProps`) to ensure fast load times and up-to-date information directly from the database.
*   **Prisma Singleton Pattern**: A single, efficient Prisma Client instance is used across the application to prevent database connection exhaustion.
*   **Data Seeding**: A robust seeding script populates the database with realistic, high-quality data.

## ⚙️ Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd mini-spade-poc
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Supabase database connection string:
    ```
    DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:5432/postgres"
    ```

4.  **Run database migrations:**
    This will create the `Patent` table in your database.
    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database:**
    This will populate your database with the initial set of patent data.
    ```bash
    npm run prisma:seed
    ```

6.  **Start the development server:**
    ```bash
    npm run dev
    ```

    Open http://localhost:3000 to view the application.

