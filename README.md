# My Wordle Monad

A Wordle-inspired word guessing game built with React and Vite, featuring online leaderboards powered by Supabase.

## Features

- Classic Wordle gameplay
- Online leaderboards
- Responsive design
- Real-time scoring

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/xurrydep/nadle-repo.git
   cd my-wordle-monad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

This project requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

See `.env.example` for the required format.

## Technologies Used

- React
- Vite
- Supabase
- CSS3
