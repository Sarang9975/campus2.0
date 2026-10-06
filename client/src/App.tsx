import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { DemoBar } from './components/DemoBar.js';
import { Navbar } from './components/Navbar.js';
import { BottomNav } from './components/BottomNav.js';

import { HomePage } from './pages/HomePage.js';
import { DiscoverPage } from './pages/DiscoverPage.js';
import { CreatePlanPage } from './pages/CreatePlanPage.js';
import { PlanDetailPage } from './pages/PlanDetailPage.js';
import { MyPlansPage } from './pages/MyPlansPage.js';
import { MessagesPage } from './pages/MessagesPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111111]">
          {/* Judge Demo Bar for Presentation Testing */}
          <DemoBar />

          {/* Desktop & Mobile Main Header */}
          <Navbar />

          {/* Page Routing */}
          <main className="flex-1 pb-20 md:pb-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/create" element={<CreatePlanPage />} />
              <Route path="/plans/:id" element={<PlanDetailPage />} />
              <Route path="/my-plans" element={<MyPlansPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
