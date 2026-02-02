'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { useRouter } from 'next/navigation';

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        // Store tokens in cookies for middleware
        // Add secure flag for production (HTTPS) environments
        const isProduction = window.location.protocol === 'https:';
        const secureFlag = isProduction ? '; secure' : '';
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; samesite=lax${secureFlag}`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax${secureFlag}`;
        
        // Log the login action
        try {
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
            }),
          });
        } catch (logError) {
          console.warn('Failed to log login action:', logError);
          // Don't prevent login for logging failures
        }

        // Redirect to dashboard
        router.push('/backoffice');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={() => {
            setShowForgotPassword(true);
            setForgotEmail('');
            setForgotStep('email');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setForgotError('');
            setForgotSuccess('');
          }}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded text-green-400 text-sm">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 'email' && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Enter your email address and we'll send you a verification code.</p>
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  {forgotLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {forgotStep === 'otp' && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Enter the 6-digit code sent to your email.</p>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={forgotLoading || otp.length !== 6}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  {forgotLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep('email')}
                  className="w-full text-gray-400 hover:text-gray-300 text-sm"
                >
                  Back to email
                </button>
              </div>
            )}

            {forgotStep === 'newPassword' && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Enter your new password.</p>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={forgotLoading || !newPassword || !confirmPassword || newPassword.length < 8}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );

  async function handleRequestCode() {
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setForgotSuccess('Verification code sent to your email');
      setForgotStep('otp');
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setForgotSuccess('Code verified. Enter your new password.');
      setForgotStep('newPassword');
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setForgotSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        setShowForgotPassword(false);
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  }
}