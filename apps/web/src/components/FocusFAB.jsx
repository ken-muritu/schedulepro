import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './AppIcon';

const FAB_PAGES = ['/dashboard', '/daily-view', '/weekly-planner'];

const FocusFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShow = FAB_PAGES?.some(p => location?.pathname === p || location?.pathname?.startsWith(p + '/'));

  if (!shouldShow) return null;

  return (
    <button
      onClick={() => navigate('/focus')}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
      style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        boxShadow: '0 4px 20px rgba(99,102,241,0.5)'
      }}
      aria-label="Enter Focus Mode"
      title="Focus Mode"
    >
      <Icon name="Target" size={24} color="#FFFFFF" strokeWidth={2} />
    </button>
  );
};

export default FocusFAB;
