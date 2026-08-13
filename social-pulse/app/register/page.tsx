'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, session, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace('/');
  }, [session, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    const res = await register(name.trim(), email.trim(), password);
    if (!res.ok) { setError(res.error ?? 'Registration failed.'); setSubmitting(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.15"/>
              <path d="M6 20 L10 10 L14 15 L18 8 L22 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="22" cy="18" r="2" fill="white"/>
            </svg>
          </div>
          <span className="auth-logo-text">Social Pulse</span>
        </div>

        <div className="auth-heading">Create account</div>
        <div className="auth-subheading">Start tracking your social performance</div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="reg-name">Full name</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input id="reg-name" type="text" placeholder="Your name" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="reg-email">Email address</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input id="reg-email" type="email" placeholder="you@example.com" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="reg-confirm">Confirm password</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="reg-confirm" type="password" placeholder="Repeat password" className="auth-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>

          {/* Password strength */}
          {password.length > 0 && (
            <div className="auth-strength">
              <div className="auth-strength-bar">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`auth-strength-seg${password.length >= (i + 1) * 3 ? ' filled' : ''}`} style={{ background: password.length >= 12 ? 'var(--up)' : password.length >= 8 ? 'var(--flat)' : password.length >= 4 ? '#e08830' : 'var(--down)' }} />
                ))}
              </div>
              <span className="auth-strength-label">
                {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : password.length >= 4 ? 'Fair' : 'Weak'}
              </span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={submitting} id="btn-register">
            {submitting ? <span className="auth-spinner" /> : null}
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>

        <Link href="/login" className="auth-link-btn" id="link-login">
          Sign in instead
        </Link>

        <div className="auth-footnote">
          Your data stays private — stored only in this browser.
        </div>
      </div>
    </div>
  );
}
