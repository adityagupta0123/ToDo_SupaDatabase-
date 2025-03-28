# Todo List Application

A full-stack Todo List application built with the PERN stack (PostgreSQL, Express.js, React, Node.js) and Supabase for authentication and database.

## Features

- User Authentication (Sign up, Login, Logout)
- CRUD operations for todos
- Protected routes
- Modern UI with Material-UI
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-app
```

2. Set up Supabase:
   - Create a new project on Supabase
   - Run the SQL commands in `backend/supabase/schema.sql` in the Supabase SQL editor
   - Get your project URL and anon key from the project settings

3. Backend Setup:
```bash
cd backend
npm install
cp .env.example .env
```
Edit the `.env` file with your Supabase credentials:
```
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

4. Frontend Setup:
```bash
cd ../frontend
npm install
cp .env.example .env
```
Edit the `.env` file with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── supabase/
│   │   └── schema.sql
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.tsx
    │   │   ├── SignUp.tsx
    │   │   └── TodoList.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── lib/
    │   │   └── supabase.ts
    │   └── App.tsx
    ├── package.json
    └── .env
```

## API Endpoints

- `GET /api/todos` - Get all todos for the authenticated user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Security

- Row Level Security (RLS) policies are implemented in Supabase
- JWT authentication is used for API requests
- Protected routes in the frontend
- Secure password handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 