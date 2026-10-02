'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import NovaLogo from '@/components/NovaLogo';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('zoorich_token') || localStorage.getItem('nova_token') || localStorage.getItem('apex_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #1f1f23',
          backgroundColor: '#0a0a0c',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <NovaLogo size="sm" subtitle="Private Banking • Zürich" />
        </Link>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/login" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            Sign In
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            Open Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          padding: '48px 20px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: '#16161a',
            border: '1px solid #2a2a30',
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '0.8rem',
            color: '#a1a1aa',
            marginBottom: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={15} color="#10b981" />
          <span>Double-Entry Ledger & PIN Protection</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.1rem, 7vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: '18px',
            letterSpacing: '-0.02em',
          }}
        >
          Simple, Fast Digital Banking
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.95rem, 3vw, 1.15rem)',
            color: '#a1a1aa',
            maxWidth: '560px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          Experience instant transfers, high-security transaction authorization, 4.85% APY savings vaults,
          and a seamless mobile app experience.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', width: '100%', maxWidth: '420px' }}>
          <Link
            href="/register"
            className="btn-primary"
            style={{ fontSize: '0.95rem', padding: '14px 24px', flex: '1 1 180px' }}
          >
            Open an Account <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="btn-secondary"
            style={{ fontSize: '0.95rem', padding: '14px 24px', flex: '1 1 180px' }}
          >
            Sign In to Account
          </Link>
        </div>

        {/* 3 Core Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            width: '100%',
            marginTop: '48px',
            textAlign: 'left',
          }}
        >
          <div className="clean-card" style={{ padding: '22px', backgroundColor: '#0d0d10' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              🔒 Protected Transfers
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.5 }}>
              6-digit transaction PIN required for all fund transfers with automatic lockout on failed attempts.
            </p>
          </div>

          <div className="clean-card" style={{ padding: '22px', backgroundColor: '#0d0d10' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              ⚡ Instant Peer-to-Peer
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Send money directly by account number with live recipient verification and saved payees.
            </p>
          </div>

          <div className="clean-card" style={{ padding: '22px', backgroundColor: '#0d0d10' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              📱 Mobile App Mode
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Full responsive bottom dock navigation, native drawer sheets, 3D card controls, and live statements.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '20px 24px',
          borderTop: '1px solid #1f1f23',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          color: '#71717a',
          fontSize: '0.82rem',
          backgroundColor: '#0a0a0c',
        }}
      >
        <div>© 2026 Zoorich Bank. All rights reserved.</div>
        <div>Zoorich Private Core Banking Engine</div>
      </footer>
    </main>
  );
}
