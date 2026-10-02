'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import {
  X,
  Phone,
  Mail,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (emailOrPhone: string) => void;
  initialMethod?: 'phone' | 'email';
  initialIdentifier?: string;
}

type Step = 'REQUEST' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  initialMethod = 'phone',
  initialIdentifier = '',
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('REQUEST');
  const [method, setMethod] = useState<'phone' | 'email'>(initialMethod);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [maskedDestination, setMaskedDestination] = useState('');
  const [userId, setUserId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync initial identifier or reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('REQUEST');
      setMethod(initialMethod);
      setIdentifier(initialIdentifier);
      setOtp('');
      setDemoOtp(null);
      setError(null);
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMethod, initialIdentifier]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError(method === 'phone' ? 'Please enter your registered phone number.' : 'Please enter your registered email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await ApiClient.post('/auth/forgot-password/request-otp', {
        identifier: identifier.trim(),
        method,
      });

      if (response.success && response.data) {
        setUserId(response.data.userId);
        setMaskedDestination(response.data.maskedDestination);
        if (response.data.demoOtp) {
          setDemoOtp(response.data.demoOtp);
        }
        setStep('VERIFY_OTP');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to find an account with this information.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await ApiClient.post('/auth/forgot-password/verify-otp', {
        userId,
        otp: otp.trim(),
      });

      if (response.success && response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep('RESET_PASSWORD');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await ApiClient.post('/auth/forgot-password/reset', {
        userId,
        resetToken,
        newPassword,
      });

      if (response.success) {
        setStep('SUCCESS');
        if (onSuccess) {
          onSuccess(identifier);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="clean-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0d0d10',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.1)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #27272a',
            color: '#a1a1aa',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#38bdf8',
              marginBottom: '14px',
            }}
          >
            {step === 'SUCCESS' ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : step === 'VERIFY_OTP' ? (
              <Smartphone size={24} />
            ) : step === 'RESET_PASSWORD' ? (
              <Lock size={24} />
            ) : (
              <KeyRound size={24} />
            )}
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {step === 'REQUEST' && 'Reset Account Password'}
            {step === 'VERIFY_OTP' && 'Verify Security Code'}
            {step === 'RESET_PASSWORD' && 'Create New Password'}
            {step === 'SUCCESS' && 'Password Reset Complete'}
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '4px', lineHeight: 1.4 }}>
            {step === 'REQUEST' &&
              'Choose your recovery method below to receive a one-time verification code (OTP).'}
            {step === 'VERIFY_OTP' && `A 6-digit verification code has been dispatched to ${maskedDestination}.`}
            {step === 'RESET_PASSWORD' && 'Choose a strong, unique password to secure your banking vault.'}
            {step === 'SUCCESS' && 'Your credentials have been securely updated. You can now log in.'}
          </p>
        </div>

        {/* Progress Dots */}
        {step !== 'SUCCESS' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '22px' }}>
            <div
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: '#3b82f6',
              }}
            />
            <div
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: step === 'VERIFY_OTP' || step === 'RESET_PASSWORD' ? '#3b82f6' : '#27272a',
                transition: 'background-color 0.3s ease',
              }}
            />
            <div
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: step === 'RESET_PASSWORD' ? '#3b82f6' : '#27272a',
                transition: 'background-color 0.3s ease',
              }}
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'REQUEST' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Recovery Method Switcher */}
            <div>
              <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>
                Select Verification Channel
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: '#131318',
                  padding: '4px',
                  borderRadius: '10px',
                  border: '1px solid #222226',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMethod('phone');
                    setError(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: method === 'phone' ? '#2563eb' : 'transparent',
                    color: method === 'phone' ? '#ffffff' : '#a1a1aa',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Phone size={15} />
                  <span>Phone Number</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('email');
                    setError(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: method === 'email' ? '#2563eb' : 'transparent',
                    color: method === 'email' ? '#ffffff' : '#a1a1aa',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Mail size={15} />
                  <span>Email Address</span>
                </button>
              </div>
            </div>

            {/* Input field */}
            <div>
              <label className="input-label">
                {method === 'phone' ? 'Registered Mobile Number' : 'Registered Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={method === 'phone' ? 'tel' : 'email'}
                  required
                  className="input-field"
                  placeholder={method === 'phone' ? 'e.g. +1 555-0199 or 9876543210' : 'e.g. name@example.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717a',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {method === 'phone' ? <Phone size={18} /> : <Mail size={18} />}
                </div>
              </div>
              <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '6px' }}>
                {method === 'phone'
                  ? 'We will generate a 6-digit OTP code to verify your phone.'
                  : 'We will generate a 6-digit OTP code to verify your email.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={17} />
                  <span>Sending Security Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'VERIFY_OTP' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Demo Helper Banner */}
            {demoOtp && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08))',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#10b981" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>
                      Simulated SMS / OTP Code
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '3px', fontFamily: 'monospace' }}>
                      {demoOtp}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(demoOtp)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#6ee7b7',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  Enter 6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Change {method === 'phone' ? 'phone' : 'email'}
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                className="input-field"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '12px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#71717a' }}>
              <span>Didn&apos;t receive the code?</span>
              {resendCooldown > 0 ? (
                <span style={{ color: '#a1a1aa' }}>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={17} />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify & Proceed</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 'RESET_PASSWORD' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#93c5fd',
                fontSize: '0.82rem',
              }}
            >
              <ShieldCheck size={16} color="#38bdf8" />
              <span>Identity verified via OTP. You can now define your new password.</span>
            </div>

            <div>
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="input-field"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="input-field"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
              <span style={{ color: newPassword.length >= 8 ? '#10b981' : '#71717a' }}>
                • Minimum 8 characters
              </span>
              <span style={{ marginLeft: '12px', color: newPassword && newPassword === confirmPassword ? '#10b981' : '#71717a' }}>
                • Passwords match
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={17} />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound size={17} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                color: '#10b981',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Password Reset Successful!
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Your account password has been updated securely. You can now log into your banking dashboard using your new credentials.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Back to Sign In</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
