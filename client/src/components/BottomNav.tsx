import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, MessageSquare, User as UserIcon } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const links = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Create', path: '/create', icon: Plus, isCreate: true },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-lg border-t border-[#E4E6EB] px-3 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {links.map((link) => {
          const active =
            link.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.path);
          const Icon = link.icon;

          if (link.isCreate) {
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative -top-3 flex items-center justify-center w-12 h-12 rounded-full bg-[#1746B8] text-white shadow-lg press-tactile transition-transform hover:scale-105 border-2 border-[#FAFAF8]"
                aria-label="Create Plan"
              >
                <Plus className="w-6 h-6 text-[#F5A623]" />
              </Link>
            );
          }

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
                active ? 'text-[#1746B8]' : 'text-[#666D7A] hover:text-[#111111]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
