import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  onGoogleLogin?: () => Promise<void>;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister, onGoogleLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!otpEmail.trim()) {
      alert('Mohon masukkan email kamu');
      return;
    }
    setOtpLoading(true);
    try {
      // Gunakan backend custom OTP via Gmail
      const { authAPI } = await import('../utils/api');
      const response = await authAPI.sendOTP(otpEmail);
      setOtpSent(true);
      // Show OTP in development mode if returned
      if (response.data?.otp) {
        alert(`Development Mode - Kode OTP: ${response.data.otp}`);
      }
    } catch (error: any) {
      console.error('OTP error:', error);
      alert(error.response?.data?.message || 'Gagal mengirim OTP. Silakan coba lagi.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      alert('Mohon masukkan kode OTP 6 digit');
      return;
    }
    setVerifyLoading(true);
    try {
      const { authAPI } = await import('../utils/api');
      await authAPI.verifyOTP(otpEmail, otpCode);
      // Reload page to trigger auth check
      window.location.href = '/';
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      alert(error.response?.data?.message || 'Kode OTP salah atau sudah kadaluarsa');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teardrop Chat</h1>
          <p className="text-gray-600">Sign in to start chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* OTP Login */}
          <button
            type="button"
            onClick={() => setShowOtpModal(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">📧</span>
            Sign in with Email OTP
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-primary-500 font-medium hover:text-primary-600"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">Test Accounts:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="bg-gray-50 p-2 rounded">adi@example.com / password123</div>
            <div className="bg-gray-50 p-2 rounded">haq@example.com / password123</div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Email OTP Login</h2>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpSent(false);
                  setOtpEmail('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!otpSent ? (
              <>
                <p className="text-gray-600 mb-6">
                  Enter your email to receive a one-time password (OTP) for secure login.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpLoading || !otpEmail.trim()}
                    className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Masukkan Kode OTP</h3>
                <p className="text-gray-600 mb-6">
                  Kami telah mengirim kode OTP ke <span className="font-semibold">{otpEmail}</span>.
                  Silakan cek email kamu.
                </p>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => {
                        // Only allow numbers and max 6 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpCode(value);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl font-bold tracking-widest"
                    />
                    <p className="text-xs text-gray-500 mt-2">Kode berlaku selama 10 menit</p>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifyLoading || otpCode.length !== 6}
                    className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="text-primary-500 font-medium hover:text-primary-600 text-sm"
                  >
                    ← Kirim ulang OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
