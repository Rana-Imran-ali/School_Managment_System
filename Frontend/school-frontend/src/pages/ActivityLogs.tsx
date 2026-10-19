import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Clock } from 'lucide-react';
import type { ActivityLog } from '../types';
import { initialActivityLogs, getStoredData, saveStoredData } from '../data/mockData';
import { adminService } from '../api/adminService';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(() =>
    getStoredData('activity_logs_list', initialActivityLogs)
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    adminService
      .getActivityLogs()
      .then((res) => {
        if (isMounted && res?.items && res.items.length > 0) {
          const liveLogs: ActivityLog[] = res.items.map((l: any) => ({
            id: l.id,
            user_id: l.user?.id || 1,
            user_name: l.user?.name || 'System Operator',
            action: l.action || l.module || 'Audit Operation',
            details: l.activity || l.details || '',
            ip_address: l.ip_address || '127.0.0.1',
            created_at: l.created_at || 'Just now',
          }));
          setLogs(liveLogs);
          saveStoredData('activity_logs_list', liveLogs);
        }
      })
      .catch((err) => {
        console.warn('Backend activity logs fetch error, using local data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="activity-logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Audit Trail & Security Logs</h1>
          <p className="page-subtitle">
            Immutable tracking records of critical administrative operations, logins, fee issuances, and mark edits.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search audit trail by user, action, or payload detail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0.5rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Operation / Action</th>
                <th>IP Address</th>
                <th>Audit Timestamp</th>
                <th>Details & Payload</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                      <strong style={{ color: 'var(--text-main)' }}>{log.user_name || 'System Operator'}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} /> {log.created_at}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
