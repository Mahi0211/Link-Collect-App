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
  };

  // Sign In submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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
        backgroundColor: colors.bg,
        background: isDark
          ? 'radial-gradient(ellipse at top, #181824 0%, #09090b 100%)'
          : 'radial-gradient(ellipse at top, #f1f5f9 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: isDark ? colors.cardBg : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: '22px',
          padding: '34px 32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${colors.accentFrom || '#6366f1'}, ${colors.accentTo || '#9333ea'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 14px auto',
              boxShadow: `0 8px 20px ${colors.accentLight || 'rgba(99, 102, 241, 0.25)'}`,
            }}
          >
            <Layers size={24} strokeWidth={2.2} />
          </div>

          <h1
            style={{
              fontSize: '23px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
              color: colors.text,
            }}
          >
            {mode === 'create' ? 'Create your account' : 'Welcome to LinkCollect'}
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: colors.textSecondary,
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
            backgroundColor: isDark ? colors.bgTertiary : '#f1f5f9',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '4px',
            display: 'flex',
            gap: '4px',
            marginBottom: '22px',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabSwitch('create')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'create' ? (isDark ? '#27272a' : '#ffffff') : 'transparent',
              color: mode === 'create' ? colors.text : colors.textTertiary,
              fontSize: '13px',
              fontWeight: mode === 'create' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: mode === 'create' ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none',
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'login' ? (isDark ? '#27272a' : '#ffffff') : 'transparent',
              color: mode === 'login' ? colors.text : colors.textTertiary,
              fontSize: '13px',
              fontWeight: mode === 'login' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none',
            }}
          >
            Sign In
          </button>
        </div>

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
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: '6px',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User
                  size={16}
                  style={{ position: 'absolute', left: '12px', color: colors.textTertiary }}
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
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                    color: colors.text,
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
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
          )}

          {/* Email Address Input */}
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
              {mode === 'create' ? 'Email Address' : 'Email or Username'}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', color: colors.textTertiary }}
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
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
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
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', color: colors.textTertiary }}
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
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: colors.textTertiary,
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
              <div style={{ marginTop: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {[1, 2, 3, 4].map((level) => {
                    const isFilled = strength.score >= level;
                    return (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '3.5px',
                          borderRadius: '2px',
                          backgroundColor: isFilled ? strength.color : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'),
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
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: '6px',
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShieldCheck
                  size={16}
                  style={{ position: 'absolute', left: '12px', color: colors.textTertiary }}
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
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                    color: colors.text,
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: colors.textTertiary,
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
                gap: '9px',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '3px',
              }}
            >
              <div
                onClick={() => setAgreeTerms(!agreeTerms)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  border: agreeTerms ? `1px solid ${colors.accent || '#8b5cf6'}` : `1px solid ${colors.border}`,
                  backgroundColor: agreeTerms ? (colors.accent || '#8b5cf6') : (isDark ? colors.bgTertiary : '#f8fafc'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {agreeTerms && <Check size={12} color="#ffffff" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '12px', color: colors.textSecondary, lineHeight: '1.4' }}>
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: colors.accent || '#8b5cf6', textDecoration: 'underline' }}
                >
                  Terms of Service
                </a>{' '}
                &amp;{' '}
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: colors.accent || '#8b5cf6', textDecoration: 'underline' }}
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
                backgroundColor: colors.dangerLight,
                border: `1px solid ${colors.danger}40`,
                borderRadius: '8px',
                padding: '9px 13px',
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
            disabled={
              loading ||
              !email ||
              !password ||
              (mode === 'create' && (!fullName || !agreeTerms || !confirmPassword))
            }
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.accentFrom || '#6366f1'}, ${colors.accentTo || '#9333ea'})`,
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
                  ? 0.6
                  : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 4px 14px ${colors.accentLight || 'rgba(99, 102, 241, 0.25)'}`,
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
          <p style={{ margin: 0, fontSize: '12.5px', color: colors.textSecondary }}>
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
                    color: colors.accent || '#8b5cf6',
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
                    color: colors.accent || '#8b5cf6',
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
        </div>
      </div>
    </div>
  );
}
