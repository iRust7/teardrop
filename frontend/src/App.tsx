import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import ChatWindow from './components/ChatWindow';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './index.css';

const AppContent = () => {
  const { isAuthenticated, login, register, authError } = useChat();
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegister={register}
          onSwitchToLogin={() => setShowRegister(false)}
          error={authError || undefined}
        />
      );
    }

    return (
      <LoginForm
        onLogin={login}
        onSwitchToRegister={() => setShowRegister(true)}
        error={authError || undefined}
      />
    );
  }

  return <ChatWindow />;
};

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
