import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import rawData from './sample-data.json';
import LinkCollectionsApp from './components/Linkcollectionsapp';

const data = {
  ...rawData,
  email: import.meta.env.VITE_APP_EMAIL,
  password: import.meta.env.VITE_APP_PASSWORD,
};

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
      localStorage.removeItem('linkapp-user');
      localStorage.removeItem('linkapp-token');
      return false;
    }
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsLoggedIn(false);
    };
    window.addEventListener('linkapp-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('linkapp-unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('linkapp-user');
    localStorage.removeItem('linkapp-token');
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
      <LoginPage
        data={data}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
      />
    );
  }

  return (
    <LinkCollectionsApp
      data={data}
      onLogout={handleLogout}
      theme={theme}
      onThemeChange={handleThemeChange}
    />
  );
}