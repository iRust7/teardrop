import { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import ChatWindow from './components/ChatWindow';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './index.css';

const AppContent = () => {
  const { isAuthenticated, login, register, authError, isLoading } = useChat() as any;
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Trustdrop Chat...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait</div>
        </div>
      </div>
    );
  }

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
