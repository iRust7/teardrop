import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../utils/api';

interface RegisterFormProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  error?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin, error }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Turnstile states
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>('');

  // Load Turnstile script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            setTurnstileToken(token);
          },
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!turnstileToken) {
      setValidationError('Please complete the security check');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(username, email, password, turnstileToken);
      
      if (response.needsVerification) {
        setRegisteredEmail(email);
        setShowOtpModal(true);
      } else {
        await onRegister(username, email, password);
      }
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Registration failed');
      // Reset Turnstile
      if (window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
        setTurnstileToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      setValidationError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await authAPI.verifyRegistrationOTP(registeredEmail, otpCode);
      
      // Store token and redirect to chat
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Reload to update app state
      window.location.reload();
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    try {
      await authAPI.resendOTP(registeredEmail);
      setValidationError('');
      alert('New OTP sent to your email!');
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💬</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join Teardrop Chat today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error || validationError}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Choose a username"
              />
            </div>

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
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            {/* Turnstile Widget */}
            <div className="flex justify-center">
              <div ref={turnstileRef}></div>
            </div>

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary-500 font-medium hover:text-primary-600"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a 6-digit OTP code to <span className="font-semibold">{registeredEmail}</span>.
                Please check your inbox.
              </p>

              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {validationError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(value);
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl font-bold tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-2">Code expires in 10 minutes</p>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otpCode.length !== 6}
                  className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={handleResendOTP}
                    disabled={otpLoading}
                    className="text-primary-500 font-medium hover:text-primary-600"
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={() => {
                      setShowOtpModal(false);
                      setOtpCode('');
                      setValidationError('');
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterForm;
