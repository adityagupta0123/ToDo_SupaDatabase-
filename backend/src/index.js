require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5001;

// Initialize Supabase client with anon key for auth verification
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Specific origin for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add error handling middleware for CORS
app.use((err, req, res, next) => {
  console.error('CORS Error:', err);
  res.status(500).json({ error: 'CORS error occurred' });
});

// Add OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }

    console.log('Verifying token with Supabase...');
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    if (!user) {
      console.log('No user found for token');
      return res.status(403).json({ error: 'User not found' });
    }

    console.log('User authenticated successfully:', user.id);
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

// Routes
// Get all todos for authenticated user
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching todos for user:', req.user.id);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Todos fetched successfully');
    res.json(data);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new todo
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { task, due_date } = req.body;
    console.log('Creating todo for user:', req.user.id);
    const { data, error } = await supabase
      .from('todos')
      .insert([{ 
        task, 
        user_id: req.user.id, 
        completed: false,
        date: due_date || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Todo created successfully');
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update todo
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { task, completed, due_date } = req.body;
    console.log('Updating todo:', id, 'for user:', req.user.id);
    const { data, error } = await supabase
      .from('todos')
      .update({ 
        task, 
        completed,
        date: due_date || null
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Todo updated successfully');
    res.json(data);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting todo:', id, 'for user:', req.user.id);
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Todo deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 