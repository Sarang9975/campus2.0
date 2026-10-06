import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { NotificationItem } from '../types/index.js';
import {
  Compass,
  Calendar,
  PlusCircle,
  MessageSquare,
  User as UserIcon,
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser, location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications(currentUser?._id);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // Quiet fail
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?._id }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover', path: '/discover' },
    { label: 'My Plans', path: '/my-plans' },
    { label: 'Messages', path: '/messages' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E4E6EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#1746B8] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="font-mono font-extrabold text-base tracking-tighter text-[#F5A623]">
                C2
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-[#111111] leading-none">
                Campus 2.0
              </span>
              <span className="text-[10px] text-[#666D7A] font-medium tracking-wide">
                MANIT BHOPAL
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#E8EEFB] text-[#1746B8]'
                      : 'text-[#666D7A] hover:text-[#111111] hover:bg-black/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Create Plan CTA */}
          <Link
            to="/create"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#1746B8] hover:bg-[#123796] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm press-tactile transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#F5A623]" />
            <span>Create a Plan</span>
          </Link>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#666D7A] hover:text-[#111111] hover:bg-black/5 rounded-xl relative transition-colors focus-ring"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#F5A623] text-[#111111] text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification drop panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4E6EB] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-[#FAFAF8] border-b border-[#E4E6EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#111111]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#1746B8] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#1746B8] font-medium hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E6EB]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#666D7A]">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n._id}
                        to={n.actionUrl || '/my-plans'}
                        onClick={() => setShowNotifications(false)}
                        className={`p-3 block hover:bg-stone-50 transition-colors ${
                          !n.read ? 'bg-[#E8EEFB]/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {n.type === 'PLAN_RECOVERED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : n.type === 'SPOT_RELEASED' || n.type === 'RECONFIRM_REQUIRED' ? (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Flame className="w-4 h-4 text-[#1746B8]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#111111]">{n.title}</p>
                            <p className="text-xs text-[#666D7A] line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile avatar link */}
          {currentUser && (
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-2 pr-3 bg-white border border-[#E4E6EB] rounded-full hover:border-[#1746B8]/40 transition-colors shadow-2xs"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-[#1746B8]/20"
              />
              <span className="text-xs font-semibold text-[#111111] max-w-[90px] truncate hidden sm:inline">
                {currentUser.name.split(' ')[0]}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#1746B8] hidden sm:inline" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
