# Hokie Nest Housing

A React-based web application for housing management built with Vite, TypeScript, and Supabase.

## Prerequisites

Before running this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Environment Setup

The project uses environment variables for Supabase configuration. Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Running the Development Server

To start the development server:

```bash
npm run dev
```

This will start the Vite development server. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

### 5. Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code linting
- `npm test` - Run tests using Vitest
- `npm run coverage` - Run tests with coverage report

## Technology Stack

- React 18
- TypeScript
- Vite
- Supabase
- TailwindCSS
- React Router DOM
- React Hot Toast
- Testing Library (React)
- Vitest

## Project Structure

```
hokie-nest/
├── src/           # Source code
├── supabase/      # Supabase configuration
├── public/        # Static assets
├── index.html     # Entry HTML file
└── package.json   # Project dependencies and scripts
```


## Testing

Run the test suite:

```bash
npm test
```

For test coverage report:

```bash
npm run coverage
``` 
