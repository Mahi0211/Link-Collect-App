import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import rawData from './sample-data.json';
import LinkCollectionsApp from './components/Linkcollectionsapp';
import { clearUserSession } from './utils/api';

const data = {
  ...rawData,
  email: import.meta.env.VITE_APP_EMAIL,
  password: import.meta.env.VITE_APP_PASSWORD,
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '420px', marginBottom: '16px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 18px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Initialize theme directly from localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('linkapp-theme') || 'light';
  });

  // Initialize login state directly from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedUser = localStorage.getItem('linkapp-user');

    if (!savedUser) return false;

    try {
      const user = JSON.parse(savedUser);
      return Boolean(user?.isLoggedIn);
    } catch {
      clearUserSession();
      return false;
    }
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      clearUserSession();
      setIsLoggedIn(false);
    };
    window.addEventListener('linkapp-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('linkapp-unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearUserSession();
    setIsLoggedIn(false);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('linkapp-theme', newTheme);
  };

  // if (isLoading) {
  //   return (
  //     <div
  //       style={{
  //         minHeight: '100vh',
  //         display: 'flex',
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //         background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
  //         fontSize: '18px',
  //         color: '#666',
  //       }}
  //     >
  //       Loading...
  //     </div>
  //   );
  // }

  if (!isLoggedIn) {
    return (
      <ErrorBoundary>
        <LoginPage
          data={data}
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <LinkCollectionsApp
        data={{
          email: data.email,
          username: data.username,
          name: data.name,
        }}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
    </ErrorBoundary>
  );
}