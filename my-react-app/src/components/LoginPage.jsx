import React, { useState } from 'react';
import { Layers, Mail, Lock, User, ShieldCheck, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { themes } from '../utils/themes';
import { api, clearUserSession } from '../utils/api';

export function LoginPage({ data, onLoginSuccess, theme = 'dark' }) {
  // Mode: 'create' (Create Account) or 'login' (Sign In)
  const [mode, setMode] = useState('create');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [oauthNotice, setOauthNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  // Real-time password entropy and strength meter calculation
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#ef4444' };
      case 2:
        return { score: 2, label: 'Fair', color: '#f59e0b' };
      case 3:
        return { score: 3, label: 'Good', color: '#8b5cf6' };
      case 4:
        return { score: 4, label: 'Strong', color: '#10b981' };
      default:
        return { score: 0, label: '', color: '' };
    }
  };

  const strength = calculateStrength(password);

  // Switch between tabs
  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setOauthNotice('');
  };

  // Social Auth placeholder handler
  const handleSocialAuth = (provider) => {
    setError('');
    setOauthNotice(`${provider} OAuth authentication requires provider credentials in app configuration. Please continue with email.`);
    setTimeout(() => setOauthNotice(''), 5000);
  };

  // Sign In submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setOauthNotice('');
    setLoading(true);

    try {
      const res = await api.login(email, password);
      clearUserSession();
      if (res?.token) {
        api.setToken(res.token);
      }
      localStorage.setItem(
        'linkapp-user',
        JSON.stringify({
          id: res?.user?.id,
          email: res?.user?.email,
          username: res?.user?.username,
          name: res?.user?.name,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        })
      );
      onLoginSuccess();
    } catch (err) {
      // Offline fallback credential check
      if (data && email === data.email && password === data.password) {
        clearUserSession();
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
        return;
      }
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Account Creation submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setOauthNotice('');

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      clearUserSession();
      if (res?.token) {
        api.setToken(res.token);
      }
      localStorage.setItem(
        'linkapp-user',
        JSON.stringify({
          id: res?.user?.id,
          email: res?.user?.email,
          username: res?.user?.username,
          name: res?.user?.name,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        })
      );
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowY: 'auto',
        backgroundColor: '#09090b',
        background: 'radial-gradient(ellipse at 50% 12%, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.05) 45%, #09090b 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(18, 17, 24, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(139, 92, 246, 0.07)',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
            }}
          >
            <Layers size={26} strokeWidth={2.2} />
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--font-heading)',
              color: '#ffffff',
            }}
          >
            {mode === 'create' ? 'Create your account' : 'Welcome to LinkCollect'}
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.55)',
              margin: 0,
              lineHeight: '1.4',
            }}
          >
            Your intelligent link curation &amp; bookmark workspace
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '4px',
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabSwitch('create')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: mode === 'create' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: mode === 'create' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: mode === 'create' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: mode === 'create' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: mode === 'login' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: mode === 'login' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: mode === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
            }}
          >
            Sign In
          </button>
        </div>

        {/* Social OAuth Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialAuth('Google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={() => handleSocialAuth('GitHub')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
            }}
          >
            Or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* OAuth Notice message if clicked */}
        {oauthNotice && (
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '12px',
              color: '#c4b5fd',
              marginBottom: '16px',
              lineHeight: '1.4',
            }}
          >
            {oauthNotice}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={mode === 'create' ? handleRegister : handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >
          {/* Full Name Input (Create Mode Only) */}
          {mode === 'create' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '6px',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User
                  size={16}
                  style={{ position: 'absolute', left: '12px', color: 'rgba(255, 255, 255, 0.35)' }}
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                  }}
                  placeholder="Alex Morgan"
                  required
                  style={{
                    width: '100%',
                    padding: '10.5px 14px 10.5px 38px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email Address Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '6px',
              }}
            >
              {mode === 'create' ? 'Email Address' : 'Email or Username'}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', color: 'rgba(255, 255, 255, 0.35)' }}
              />
              <input
                type={mode === 'create' ? 'email' : 'text'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={mode === 'create' ? 'name@example.com' : 'name@example.com or username'}
                required
                style={{
                  width: '100%',
                  padding: '10.5px 14px 10.5px 38px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
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
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', color: 'rgba(255, 255, 255, 0.35)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10.5px 40px 10.5px 38px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Indicator (Create Mode Only) */}
            {mode === 'create' && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4].map((level) => {
                    const isFilled = strength.score >= level;
                    return (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '3.5px',
                          borderRadius: '2px',
                          backgroundColor: isFilled ? strength.color : 'rgba(255, 255, 255, 0.08)',
                          transition: 'background-color 0.25s ease',
                        }}
                      />
                    );
                  })}
                  {strength.label && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: strength.color,
                        marginLeft: '4px',
                        minWidth: '38px',
                        textAlign: 'right',
                      }}
                    >
                      {strength.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input (Create Mode Only) */}
          {mode === 'create' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '6px',
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShieldCheck
                  size={16}
                  style={{ position: 'absolute', left: '12px', color: 'rgba(255, 255, 255, 0.35)' }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10.5px 40px 10.5px 38px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Terms & Privacy Checkbox (Create Mode Only) */}
          {mode === 'create' && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '2px',
              }}
            >
              <div
                onClick={() => setAgreeTerms(!agreeTerms)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  border: agreeTerms ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: agreeTerms ? '#8b5cf6' : 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {agreeTerms && <Check size={13} color="#ffffff" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: '1.4' }}>
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: '#a78bfa', textDecoration: 'underline' }}
                >
                  Terms of Service
                </a>{' '}
                &amp;{' '}
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: '#a78bfa', textDecoration: 'underline' }}
                >
                  Privacy Policy
                </a>
              </span>
            </label>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12.5px',
                color: '#fca5a5',
                fontWeight: '500',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !email ||
              !password ||
              (mode === 'create' && (!fullName || !agreeTerms || !confirmPassword))
            }
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              cursor:
                loading ||
                !email ||
                !password ||
                (mode === 'create' && (!fullName || !agreeTerms || !confirmPassword))
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'all 0.2s ease',
              opacity:
                loading ||
                !email ||
                !password ||
                (mode === 'create' && (!fullName || !agreeTerms || !confirmPassword))
                  ? 0.55
                  : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              marginTop: '6px',
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>{mode === 'create' ? 'Create Free Account' : 'Sign in to Workspace'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ marginTop: '22px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.55)' }}>
            {mode === 'create' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#a78bfa',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                  }}
                >
                  Sign in to Workspace &rarr;
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('create')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#a78bfa',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                  }}
                >
                  Create an account &rarr;
                </button>
              </>
            )}
          </p>

          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
            LinkCollect • Secured with local session authentication &amp; AES-256
          </p>
        </div>
      </div>
    </div>
  );
}
