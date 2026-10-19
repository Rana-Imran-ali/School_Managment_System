/**
 * AppLayout – Main application shell with sidebar and navbar.
 * Only rendered for authenticated users.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
