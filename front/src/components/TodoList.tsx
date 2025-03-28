import React, { useState, useEffect } from 'react';
import {
  IconButton,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Menu,
  MenuItem,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  date?: string | null;
  created_at?: string;
  updated_at?: string;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const { user } = useAuth();
  const theme = useTheme();

  // Helper function to format dates for display
  const formatDisplayDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  // Helper function to format dates for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  };

  const fetchTodos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(data || []);
      setHasFetched(true);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !hasFetched) {
      fetchTodos();
    }
  }, [user, hasFetched]);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          task: newTodo,
          date: newDueDate || null,
          user_id: user?.id
        }])
        .select();

      if (error) throw error;

      setTodos(prevTodos => [data[0], ...prevTodos]);
      setNewTodo('');
      setNewDueDate('');
      setSuccess('Task added successfully');
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to add todo');
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id)
        .select();

      if (error) throw error;

      setTodos(prevTodos => 
        prevTodos.map(t => t.id === data[0].id ? data[0] : t)
      );
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setSuccess('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete todo');
    }
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo) return;

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('todos')
        .update({
          task: editingTodo.task,
          date: editingTodo.date || null
        })
        .eq('id', editingTodo.id)
        .select();

      if (error) throw error;

      setTodos(prevTodos => 
        prevTodos.map(t => t.id === data[0].id ? data[0] : t)
      );
      setEditingTodo(null);
      setSuccess('Task updated successfully');
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to update todo');
    }
  };

  const handleDeleteAll = async () => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setTodos([]);
      setSuccess('All tasks deleted successfully');
    } catch (error) {
      console.error('Error deleting all todos:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete all todos');
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (status: 'all' | 'pending' | 'completed') => {
    setFilterStatus(status);
    handleFilterClose();
  };

  const filteredTodos = todos.filter(todo => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return !todo.completed;
    if (filterStatus === 'completed') return todo.completed;
    return true;
  });

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 800, 
        mx: 'auto', 
        mt: 4,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
      }}
    >
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4, color: theme.palette.text.primary }}>
        Todo List
      </Typography>

      {/* Success Notification Popup */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            bgcolor: success?.includes('deleted') 
              ? '#f03c5d' 
              : success?.includes('updated')
              ? '#FFD700'
              : '#4caf50',
            color: success?.includes('updated') ? 'black' : 'white',
            '& .MuiAlert-icon': {
              color: success?.includes('updated') ? 'black' : 'white'
            },
            fontSize: '1rem',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Notification Popup */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            bgcolor: theme.palette.mode === 'dark' ? '#f03c5d' : '#f03c5d',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            fontSize: '1rem',
            borderRadius: 2,
            boxShadow: 3
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              border: '2px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#FFD700',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
            }
          }}
        />
        <TextField
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          sx={{
            width: '200px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#FFD700' : '#FFD700',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#FFD700' : '#FFD700',
              },
            },
            '& input': {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
              borderRadius: '4px',
              padding: '10px',
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddTodo}
          sx={{
            minWidth: 'auto',
            width: 50,
            height: 50,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? '#9c27b0' : '#FFD700',
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? '#7b1fa2' : '#FFC000',
            }
          }}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* ... (keep the existing filter and delete all buttons) ... */}

      {loading ? (
        <Typography>Loading todos...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          borderRadius: 2,
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
                }}>TASK</TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
                }}>DATE</TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
                }}>STATUS</TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
                }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTodos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {editingTodo?.id === todo.id ? (
                      <TextField
                        fullWidth
                        value={editingTodo.task}
                        onChange={(e) => setEditingTodo({ ...editingTodo, task: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateTodo()}
                        autoFocus
                      />
                    ) : (
                      todo.task
                    )}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {editingTodo?.id === todo.id ? (
                      <TextField
                        type="date"
                        value={formatDateForInput(editingTodo.date)}
                        onChange={(e) => setEditingTodo({ 
                          ...editingTodo, 
                          date: e.target.value || null 
                        })}
                        sx={{
                          width: '200px',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.mode === 'dark' ? '#FFD700' : '#FFD700',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.mode === 'dark' ? '#FFD700' : '#FFD700',
                            },
                          },
                          '& input': {
                            color: theme.palette.text.primary,
                            backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
                            borderRadius: '4px',
                            padding: '10px',
                          },
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    ) : (
                      formatDisplayDate(todo.date)
                    )}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {todo.completed ? 'Completed' : 'Pending'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => setEditingTodo(editingTodo?.id === todo.id ? null : {...todo})}
                      sx={{
                        bgcolor: '#FFD700',
                        mr: 1,
                        '&:hover': { bgcolor: '#FFC000' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleTodo(todo)}
                      sx={{
                        bgcolor: '#4caf50',
                        mr: 1,
                        '&:hover': { bgcolor: '#45a049' }
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteTodo(todo.id)}
                      sx={{
                        bgcolor: '#ff5252',
                        '&:hover': { bgcolor: '#ff1744' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default TodoList;