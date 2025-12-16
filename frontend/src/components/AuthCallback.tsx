import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { authAPI } from '../utils/api';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing login...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!session) {
        setStatus('No session found. Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      // Extract user data from Supabase session
      const { user } = session;
      const email = user.email;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0];
      const google_id = user.id;
      const avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture;

      if (!email) {
        throw new Error('Email not found in OAuth response');
      }

      setStatus('Creating session...');

      // Send to backend to create/login user and get JWT token
      const response = await authAPI.googleCallback(email, name, google_id, avatar_url);
      
      if (response.token) {
        setStatus('Login successful! Redirecting...');
        // Token is already saved by authAPI.googleCallback
        setTimeout(() => {
          window.location.href = '/'; // Full page reload to trigger auth check
        }, 1000);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      setStatus(`Login failed: ${error.message}`);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication</h2>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}
