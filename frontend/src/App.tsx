import React, { useState, useEffect } from 'react';
import { PageType, User } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { api } from './services/api';

export const App: React.FC = () => {
  const savedUser = api.getUser();
  // Mặc định luôn ưu tiên mở 'landing' (Trang chủ) đầu tiên khi người dùng nhấn vào link web
  const getInitialPage = (): PageType => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (hash && ['landing', 'dashboard', 'chat', 'roadmap', 'profile', 'admin', 'login'].includes(hash)) {
        return hash as PageType;
      }
    }
    return 'landing';
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage());
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>(savedUser?.full_name || 'Học viên');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!savedUser);

  useEffect(() => {
    // Check saved session in localStorage
    const saved = api.getUser();
    if (saved) {
      setCurrentUser(saved.full_name || 'Học viên');
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setCurrentUser('Khách');
    }

    const handleUserUpdate = (e: any) => {
      const updated = e.detail || api.getUser();
      if (updated) {
        setCurrentUser(updated.full_name || 'Học viên');
        setIsLoggedIn(true);
      }
    };
    window.addEventListener('eduadvisor_user_updated', handleUserUpdate);

    // Hỗ trợ nút Back/Forward và URL Hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (hash && ['landing', 'dashboard', 'chat', 'roadmap', 'profile', 'admin', 'login'].includes(hash)) {
        setCurrentPage(hash as PageType);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Secret shortcut Ctrl + Shift + A to open Admin for site owner
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateTo('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('eduadvisor_user_updated', handleUserUpdate);
    };
  }, []);

  const navigateTo = (page: PageType, initialPrompt?: string) => {
    if (initialPrompt !== undefined) {
      setChatPrompt(initialPrompt);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (page === 'landing') {
        if (window.location.hash) {
          window.history.pushState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        if (window.location.hash !== `#${page}`) {
          window.history.pushState(null, '', `#${page}`);
        }
      }
    } catch {}
    // Log visit in database
    api.logPageVisit('/' + (page === 'landing' ? '' : page));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user.full_name || 'Học viên Google');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    api.clearUser();
    setIsLoggedIn(false);
    setCurrentUser('Khách');
    setCurrentPage('login');
  };

  return (
    <div className={`flex flex-col bg-slate-50 text-slate-900 font-sans ${currentPage === 'chat' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar 
        currentPage={currentPage} 
        onPageChange={navigateTo} 
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
      />
      
      <main className={`flex-1 flex flex-col min-h-0 min-w-0 ${currentPage === 'chat' ? 'h-[calc(100vh-4rem)] overflow-hidden' : ''}`}>
        {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigateTo} />}
        {currentPage === 'chat' && <ChatPage initialPrompt={chatPrompt} onNavigate={navigateTo} />}
        {currentPage === 'roadmap' && <RoadmapPage onNavigate={navigateTo} />}
        {currentPage === 'profile' && <ProfilePage onNavigate={navigateTo} onLogout={handleLogout} />}
        {currentPage === 'admin' && <AdminPage onNavigate={navigateTo} />}
        {currentPage === 'login' && (
          <LoginPage 
            onNavigate={navigateTo} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>
    </div>
  );
};

export default App;
