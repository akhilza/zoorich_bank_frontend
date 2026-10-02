'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import NovaLogo from '@/components/NovaLogo';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await ApiClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data.tokens?.accessToken) {
        localStorage.setItem('zoorich_token', response.data.tokens.accessToken);
        localStorage.setItem('zoorich_user', JSON.stringify(response.data.user));
        localStorage.setItem('nova_token', response.data.tokens.accessToken);
        localStorage.setItem('apex_token', response.data.tokens.accessToken);
        localStorage.setItem('nova_user', JSON.stringify(response.data.user));
        localStorage.setItem('apex_user', JSON.stringify(response.data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: '#000000',
        color: '#ffffff',
      }}
    >
      <div
        className="clean-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          backgroundColor: '#0d0d10',
          border: '1px solid #222226',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '14px' }}>
            <NovaLogo size="lg" subtitle="Private Banking • Switzerland" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '12px' }}>Welcome Back</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to access your Zoorich Bank account
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '12px',
              color: '#6ee7b7',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setIsForgotModalOpen(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#60a5fa')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#38bdf8')}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.9rem', color: '#a1a1aa' }}>
          Need an account?{' '}
          <Link href="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>
            Create one here
          </Link>
        </div>
      </div>

      {/* Forgot Password Popup Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialMethod="phone"
        onSuccess={(emailOrPhone) => {
          setIsForgotModalOpen(false);
          setSuccessMessage('Password reset successfully! Please sign in with your new password.');
          if (emailOrPhone.includes('@')) {
            setEmail(emailOrPhone);
          }
        }}
      />
    </div>
  );
}

