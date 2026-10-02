'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import NovaLogo from '@/components/NovaLogo';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    transactionPin: '123456',
    initialDeposit: '1000',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.transactionPin && !/^\d{6}$/.test(formData.transactionPin)) {
      setError('Transaction PIN must be 6 digits (e.g. 123456)');
      return;
    }

    setLoading(true);

    try {
      const response = await ApiClient.post('/auth/register', {
        ...formData,
        initialDeposit: Number(formData.initialDeposit) || 0,
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
      setError(err.message || 'Registration failed');
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
          maxWidth: '460px',
          padding: '36px 32px',
          backgroundColor: '#0d0d10',
          border: '1px solid #222226',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '14px' }}>
            <NovaLogo size="lg" subtitle="Private Banking • Switzerland" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '12px' }}>Open Zoorich Account</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '4px' }}>
            Get your Zoorich Bank checking account and secure vault ledger instantly
          </p>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">First Name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Mobile Phone Number</label>
            <input
              type="tel"
              required
              className="input-field"
              placeholder="+1 (555) 234-5678 or 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '4px' }}>
              Used for security verification and SMS password reset OTP.
            </p>
          </div>


          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">6-Digit Security PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                className="input-field"
                placeholder="123456"
                value={formData.transactionPin}
                onChange={(e) => setFormData({ ...formData, transactionPin: e.target.value })}
                style={{ letterSpacing: '4px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label className="input-label">Initial Balance ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                className="input-field"
                placeholder="1000"
                value={formData.initialDeposit}
                onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? 'Creating...' : 'Open Account Now'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.9rem', color: '#a1a1aa' }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
