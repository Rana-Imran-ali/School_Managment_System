import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Radio } from 'lucide-react';
import type { Announcement } from '../types';
import { initialAnnouncements, getStoredData, saveStoredData } from '../data/mockData';
import { Modal } from '../components/Modal';
import { announcementService } from '../api/announcementService';
import { useAuth } from '../context/AuthContext';
import echo from '../echo';

export const Announcements: React.FC = () => {
  const { currentRole } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getStoredData('announcements_list', initialAnnouncements)
  );

  const [audienceFilter, setAudienceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load live announcements from backend
  useEffect(() => {
    let isMounted = true;
    const params = audienceFilter !== 'all' ? { audience: audienceFilter } : {};
    announcementService
      .getAnnouncements(params)
      .then((items) => {
        if (isMounted && items && items.length > 0) {
          const mapped: Announcement[] = items.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            target_audience: a.target_audience || 'all',
            priority: a.priority || 'important',
            published_at: a.publish_date || '2026-10-18',
            author_name: a.author?.name || 'Academic Affairs',
          }));
          setAnnouncements(mapped);
          saveStoredData('announcements_list', mapped);
        }
      })
      .catch((err) => {
        console.warn('Backend announcement fetch error, using local data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [audienceFilter]);

  // Real-time WebSocket listener for new Announcements via Reverb
  useEffect(() => {
    const channel = echo.channel('announcements');

    const handleNewAnnouncement = (event: any) => {
      const incoming: Announcement = {
        id: event.id || Date.now(),
        title: event.title,
        content: event.content,
        target_audience: event.target_audience || 'all',
        priority: 'important',
        published_at: event.publish_date || new Date().toISOString().substring(0, 10),
        author_name: event.author?.name || 'Academic Affairs',
      };

      setAnnouncements((prev) => {
        if (prev.some((a) => a.id === incoming.id)) return prev;
        const next = [incoming, ...prev];
        saveStoredData('announcements_list', next);
        return next;
      });
    };

    channel.listen('.AnnouncementCreated', handleNewAnnouncement);
    channel.listen('AnnouncementCreated', handleNewAnnouncement);

    return () => {
      channel.stopListening('.AnnouncementCreated', handleNewAnnouncement);
      channel.stopListening('AnnouncementCreated', handleNewAnnouncement);
      echo.leave('announcements');
    };
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all' as Announcement['target_audience'],
    priority: 'important' as Announcement['priority'],
  });

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const created = await announcementService.createAnnouncement({
        title: formData.title,
        content: formData.content,
        target_audience: formData.target_audience,
        publish_date: new Date().toISOString().substring(0, 10),
      });

      if (created) {
        const mappedNotice: Announcement = {
          id: created.id,
          title: created.title,
          content: created.content,
          target_audience: created.target_audience,
          priority: formData.priority,
          published_at: created.publish_date || new Date().toISOString().substring(0, 10),
          author_name: created.author?.name || 'Academic Affairs',
        };
        setAnnouncements((prev) => {
          if (prev.some((a) => a.id === mappedNotice.id)) return prev;
          const updated = [mappedNotice, ...prev];
          saveStoredData('announcements_list', updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend announcement publish error, saving locally:', err);
      const newNotice: Announcement = {
        id: Date.now(),
        title: formData.title,
        content: formData.content,
        target_audience: formData.target_audience,
        priority: formData.priority,
        published_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        author_name: 'Academic Affairs',
      };
      const updated = [newNotice, ...announcements];
      setAnnouncements(updated);
      saveStoredData('announcements_list', updated);
    }

    setIsModalOpen(false);
    setFormData({ title: '', content: '', target_audience: 'all', priority: 'important' });
  };

  const filtered = announcements.filter(
    (a) => audienceFilter === 'all' || a.target_audience === audienceFilter || a.target_audience === 'all'
  );

  return (
    <div id="announcements-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">School Notice Board & Bulletins</h1>
          <p className="page-subtitle">
            Broadcast institutional circulars, event notifications, and academic decrees across target groups.
          </p>
        </div>
        {(currentRole === 'admin' || currentRole === 'teacher') && (
          <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontWeight: 600,
              }}
            >
              <Radio size={13} /> Live Broadcast Feed
            </span>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Publish Notice
            </button>
          </div>
        )}
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Audience:</span>
          <select
            className="form-select"
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">Everyone (All Audiences)</option>
            <option value="teachers">Faculty Only</option>
            <option value="students">Students Only</option>
            <option value="parents">Parents Only</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((item) => (
          <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span
                className={`badge ${
                  item.priority === 'urgent'
                    ? 'badge-suspended'
                    : item.priority === 'important'
                    ? 'badge-pending'
                    : 'badge-info'
                }`}
              >
                {item.priority?.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> {item.published_at}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-main)' }}>
              {item.title}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', flex: 1 }}>
              {item.content}
            </p>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-faint)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> {item.author_name || 'Admin'}
              </span>
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                Audience: {item.target_audience}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Draft & Dispatch Notice">
        <form onSubmit={handleCreateAnnouncement}>
          <div className="form-group">
            <label className="form-label">Notice Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Annual Sports Meet 2026 Registration"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Audience *</label>
              <select
                className="form-select"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
              >
                <option value="all">All Community (Everyone)</option>
                <option value="teachers">Teaching Staff Only</option>
                <option value="students">Enrolled Students Only</option>
                <option value="parents">Parents / Guardians Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Tier</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="normal">Normal Information</option>
                <option value="important">Important Notification</option>
                <option value="urgent">Urgent / Action Required</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Body & Details *</label>
            <textarea
              required
              className="form-textarea"
              rows={4}
              placeholder="Full announcement body..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Announcements;
