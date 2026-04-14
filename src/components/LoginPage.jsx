import React, { useState } from 'react';

export function LoginPage({ data, onLoginSuccess, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const themes = {
    light: {
      bg: '#ffffff',
      bgSecondary: '#f3f4f6',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      accentFrom: '#3b82f6',
      accentTo: '#a855f7',
    },
    dark: {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      accentFrom: '#3b82f6',
      accentTo: '#a855f7',
    }
  };

  const colors = themes[theme];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      // Check credentials
      if (email === data.email && password === data.password) {
        // Store login info in localStorage
        localStorage.setItem('linkapp-user', JSON.stringify({
          email: data.email,
          username: data.username,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        }));
        
        onLoginSuccess();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme === 'light'
          ? 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: colors.bg,
          border: `0.5px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: theme === 'dark'
            ? '0 20px 25px -5px rgba(0,0,0,0.3)'
            : '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '600',
              margin: '0 0 0.5rem 0',
              color: colors.text,
            }}
          >
            {data.name}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0,
            }}
          >
            Your personal link organizer
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ marginBottom: '1.5rem' }}>
          {/* Email Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: colors.text,
                marginBottom: '0.5rem',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.bgSecondary,
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accentFrom;
                e.target.style.backgroundColor = colors.bg;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.backgroundColor = colors.bgSecondary;
              }}
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: colors.text,
                marginBottom: '0.5rem',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.bgSecondary,
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accentFrom;
                e.target.style.backgroundColor = colors.bg;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.backgroundColor = colors.bgSecondary;
              }}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '1rem',
                fontSize: '13px',
                color: theme === 'dark' ? '#fca5a5' : '#dc2626',
              }}
            >
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.accentFrom}, ${colors.accentTo})`,
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading || !email || !password ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && email && password) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {loading ? (
              <span
                style={{
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite',
                }}
              >
                ⏳
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Demo Info */}
        {/* <div
          style={{
            backgroundColor: colors.bgSecondary,
            border: `0.5px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            color: colors.textSecondary,
            lineHeight: '1.6',
          }}
        >
          <strong style={{ color: colors.text }}>Demo Credentials:</strong>
          <div style={{ marginTop: '6px' }}>
            Email: <code style={{ color: colors.accentFrom }}>{data.email}</code>
          </div>
          <div style={{ marginTop: '4px' }}>
            Password: <code style={{ color: colors.accentFrom }}>{data.password}</code>
          </div>
        </div> */}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}