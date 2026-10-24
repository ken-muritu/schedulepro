import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const tabs = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    activeIcon: 'LayoutDashboard',
    ariaLabel: 'Go to Dashboard',
  },
  {
    label: 'Weekly',
    path: '/weekly-planner',
    icon: 'CalendarDays',
    activeIcon: 'CalendarDays',
    ariaLabel: 'Go to Weekly Planner',
  },
  {
    label: 'Daily',
    path: '/daily-view',
    icon: 'CalendarClock',
    activeIcon: 'CalendarClock',
    ariaLabel: 'Go to Daily View',
  },
  {
    label: 'Performance',
    path: '/performance',
    icon: 'TrendingUp',
    activeIcon: 'TrendingUp',
    ariaLabel: 'Go to Performance',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    activeIcon: 'Settings',
    ariaLabel: 'Go to Settings',
  },
];

const BottomTabNavigation = () => {
  const location = useLocation();

  const isActive = (path) => location?.pathname === path || location?.pathname?.startsWith(path + '/');

  return (
    <nav className="bottom-tab-nav" aria-label="Primary navigation">
      {tabs?.map((tab) => {
        const active = isActive(tab?.path);
        return (
          <NavLink
            key={tab?.path}
            to={tab?.path}
            className={`bottom-tab-item ${active ? 'active' : ''}`}
            aria-label={tab?.ariaLabel}
            aria-current={active ? 'page' : undefined}
          >
            <div className="bottom-tab-icon-wrap">
              <Icon
                name={active ? tab?.activeIcon : tab?.icon}
                size={22}
                color="currentColor"
                strokeWidth={active ? 2.5 : 2}
              />
            </div>
            <span className="bottom-tab-label">{tab?.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomTabNavigation;