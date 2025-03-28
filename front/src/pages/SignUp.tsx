import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign up with:', { email });
      console.log('Supabase client:', supabase ? 'Initialized' : 'Not initialized');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        console.error('Sign up error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        throw error;
      }

      if (data) {
        console.log('Sign up successful:', data);
        setSuccess('Check your email for the confirmation link!');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default SignUp; 