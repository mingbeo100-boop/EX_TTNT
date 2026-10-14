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
import { AuthGateModal } from './components/AuthGateModal';
import { api } from './services/api';

const PROTECTED_PAGES: PageType[] = ['roadmap', 'dashboard', 'chat', 'profile', 'admin'];

export const App: React.FC = () => {
  const savedUser = api.getUser();
  const initialLoggedIn = !!savedUser;

  // Mặc định luôn ưu tiên mở 'landing' (Trang chủ) đầu tiên khi người dùng mới nhấn vào link web
  const getInitialPage = (): PageType => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (hash === 'login') return 'login';
      if (hash && PROTECTED_PAGES.includes(hash as PageType)) {
        if (api.isLoggedIn()) {
          return hash as PageType;
        }
        return 'landing';
      }
    }
    return 'landing';
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage());
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>(savedUser?.full_name || 'Khách');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialLoggedIn);

  // Auth Gate Modal State (Ràng buộc đăng nhập với thông điệp hướng dẫn rõ ràng)
  const [authGateOpen, setAuthGateOpen] = useState<boolean>(false);
  const [authGateTarget, setAuthGateTarget] = useState<PageType>('roadmap');
  const [pendingRedirect, setPendingRedirect] = useState<PageType | null>(null);

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

    // Nếu người dùng mới gõ trực tiếp URL hash của trang bảo vệ khi chưa đăng nhập
    const initialHash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (initialHash && PROTECTED_PAGES.includes(initialHash as PageType) && !api.isLoggedIn()) {
      setAuthGateTarget(initialHash as PageType);
      setPendingRedirect(initialHash as PageType);
      setAuthGateOpen(true);
    }

    const handleUserUpdate = (e: any) => {
      const updated = e.detail || api.getUser();
      if (updated) {
        setCurrentUser(updated.full_name || 'Học viên');
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setCurrentUser('Khách');
      }
    };
    window.addEventListener('eduadvisor_user_updated', handleUserUpdate);

    // Hỗ trợ nút Back/Forward và URL Hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (hash && ['landing', 'dashboard', 'chat', 'roadmap', 'profile', 'admin', 'login'].includes(hash)) {
        navigateTo(hash as PageType);
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

    // RÀNG BUỘC ĐĂNG NHẬP: Nếu bấm vào trang bảo vệ khi chưa đăng nhập
    const isProtected = PROTECTED_PAGES.includes(page);
    const userLoggedIn = api.isLoggedIn();

    if (isProtected && !userLoggedIn) {
      setAuthGateTarget(page);
      setPendingRedirect(page);
      setAuthGateOpen(true);
      return;
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

  const handleAuthGateGoToLogin = () => {
    setAuthGateOpen(false);
    setCurrentPage('login');
    try {
      window.history.pushState(null, '', '#login');
    } catch {}
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user.full_name || 'Học viên Google');
    setIsLoggedIn(true);
    setAuthGateOpen(false);

    // Tự động chuyển đến trang người dùng muốn vào trước đó (ví dụ: roadmap)
    const target = pendingRedirect || 'dashboard';
    setPendingRedirect(null);
    navigateTo(target);
  };

  const handleLogout = () => {
    api.clearUser();
    setIsLoggedIn(false);
    setCurrentUser('Khách');
    setCurrentPage('landing');
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

      {/* Cửa sổ hướng dẫn Ràng buộc Đăng nhập khi bấm vào các trang như Lộ trình */}
      <AuthGateModal
        isOpen={authGateOpen}
        targetPage={authGateTarget}
        onClose={() => setAuthGateOpen(false)}
        onGoToLogin={handleAuthGateGoToLogin}
      />
    </div>
  );
};

export default App;
