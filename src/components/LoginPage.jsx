import React, { useState } from 'react';
import { Layers, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { themes } from '../utils/themes';

export function LoginPage({ data, onLoginSuccess, theme = 'dark' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === data.email && password === data.password) {
        localStorage.setItem(
          'linkapp-user',
          JSON.stringify({
            email: data.email,
            username: data.username,
            isLoggedIn: true,
            loginTime: new Date().toISOString(),
          })
        );
        onLoginSuccess();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 450);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: colors.bg,
        background: isDark
          ? 'radial-gradient(ellipse at top, #181824 0%, #09090b 100%)'
          : 'radial-gradient(ellipse at top, #f1f5f9 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          backgroundColor: isDark ? colors.cardBg : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: '20px',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${colors.accentFrom}, ${colors.accentTo})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px auto',
              boxShadow: `0 8px 20px ${colors.accentLight}`,
            }}
          >
            <Layers size={24} />
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
              color: colors.text,
            }}
          >
            Welcome to LinkCollect
          </h1>
          <p
            style={{
              fontSize: '13.5px',
              color: colors.textSecondary,
              margin: 0,
            }}
          >
            Your intelligent link curation & bookmark workspace
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@example.com"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.backgroundColor = isDark ? '#1a1a22' : '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.backgroundColor = isDark ? colors.bgTertiary : '#f8fafc';
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.backgroundColor = isDark ? '#1a1a22' : '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.backgroundColor = isDark ? colors.bgTertiary : '#f8fafc';
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: colors.dangerLight,
                border: `1px solid ${colors.danger}40`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12.5px',
                color: colors.danger,
                fontWeight: '500',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.accentFrom}, ${colors.accentTo})`,
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading || !email || !password ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 4px 14px ${colors.accentLight}`,
              marginTop: '4px',
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Sign in to Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11.5px', color: colors.textTertiary }}>
            LinkCollect • Secured with local session authentication
          </p>
        </div>
      </div>
    </div>
  );
}