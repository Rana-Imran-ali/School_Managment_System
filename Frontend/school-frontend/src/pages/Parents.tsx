import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { parentService } from '../api/parentService';
import { useAuth } from '../context/AuthContext';

export interface ParentItem {
  id: number;
  user_id: number;
  occupation?: string;
  relationship?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
    status: string;
  };
  children?: Array<{
    id: number;
    name: string;
    admission_number: string;
    class?: string;
  }>;
  created_at?: string;
}

export const Parents: React.FC = () => {
  const { currentRole } = useAuth();
  const [parents, setParents] = useState<ParentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewParent, setViewParent] = useState<ParentItem | null>(null);
  const [parentChildren, setParentChildren] = useState<any[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    occupation: '',
    relationship: 'Father',
    address: '',
  });
  const [formError, setFormError] = useState('');

  // Fetch parents list
  const loadParents = async () => {
    setIsLoading(true);
    try {
      const data = await parentService.getParents({ search: searchTerm || undefined });
      if (data?.items) {
        setParents(data.items);
      }
    } catch (err: any) {
      console.error('Error fetching parents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParents();
  }, [searchTerm]);

  // Open view modal & fetch detailed children wards
  const handleViewParent = async (parent: ParentItem) => {
    setViewParent(parent);
    setIsLoadingChildren(true);
    try {
      const childrenData = await parentService.getChildren(parent.id);
      setParentChildren(Array.isArray(childrenData) ? childrenData : []);
    } catch {
      setParentChildren(parent.children || []);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  // Submit new parent
  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await parentService.createParent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password || undefined,
        phone: formData.phone.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
        relationship: formData.relationship || undefined,
        address: formData.address.trim() || undefined,
      });

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        occupation: '',
        relationship: 'Father',
        address: '',
      });
      loadParents();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        'Failed to register parent account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete parent profile
  const handleDeleteParent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this guardian record?')) return;
    try {
      await parentService.deleteParent(id);
      setParents((prev) => prev.filter((p) => p.id !== id));
      if (viewParent?.id === id) setViewParent(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete parent profile.');
    }
  };

  return (
    <div className="page-container" id="parents-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Parents & Guardians</h1>
          <p className="page-subtitle">
            Manage guardian accounts, family relationships, contact directories, and ward enrollments.
          </p>
        </div>
        {currentRole === 'admin' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormError('');
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Guardian
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Parents Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Guardian Name</th>
              <th>Relationship</th>
              <th>Contact Details</th>
              <th>Occupation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading guardians...
                </td>
              </tr>
            ) : parents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No guardian profiles found.
                </td>
              </tr>
            ) : (
              parents.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.user?.name || 'Unnamed Guardian'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: 'var(--bg-glass-strong)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {p.relationship || 'Guardian'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {p.user?.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={12} color="var(--text-muted)" /> {p.user.phone}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={12} color="var(--text-muted)" /> {p.user?.email}
                      </span>
                    </div>
                  </td>
                  <td>{p.occupation || '—'}</td>
                  <td>
                    <StatusBadge status={(p.user?.status as any) || 'active'} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        title="View Ward Details"
                        onClick={() => handleViewParent(p)}
                      >
                        <Eye size={16} />
                      </button>
                      {currentRole === 'admin' && (
                        <button
                          className="btn-icon delete-icon"
                          title="Delete Guardian"
                          onClick={() => handleDeleteParent(p.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Guardian Details Modal */}
      {viewParent && (
        <Modal
          isOpen={true}
          onClose={() => setViewParent(null)}
          title="Guardian Profile & Enrolled Children"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                }}
              >
                {viewParent.user?.name ? viewParent.user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{viewParent.user?.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewParent.relationship || 'Guardian'}</span>
                  •
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewParent.occupation || 'Occupation N/A'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email Address</div>
                <div style={{ fontWeight: 500, marginTop: '0.2rem' }}>{viewParent.user?.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Number</div>
                <div style={{ fontWeight: 500, marginTop: '0.2rem' }}>{viewParent.user?.phone || '—'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Residential Address</div>
                <div style={{ fontWeight: 500, marginTop: '0.2rem' }}>{viewParent.user?.address || 'Not registered'}</div>
              </div>
            </div>

            {/* Wards / Children */}
            <div>
              <h4 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GraduationCap size={16} color="var(--primary)" /> Enrolled Children (Wards)
              </h4>
              {isLoadingChildren ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading wards...</div>
              ) : parentChildren.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem', background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)' }}>
                  No student profiles currently linked to this guardian.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {parentChildren.map((child: any) => (
                    <div
                      key={child.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-glass-strong)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{child.name || child.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Admission: {child.admission_number}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#6366f1',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        {child.class || child.current_class?.name || 'Class Assigned'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Guardian Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Parent / Guardian"
        >
          <form onSubmit={handleAddParent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formError && (
              <div style={{ padding: '0.6rem 0.85rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                {formError}
              </div>
            )}

            <div className="form-group">
              <label>Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. David Reynolds"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. david.reynolds@example.com"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Relationship *</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Password (Optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: password123"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Residential Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full residential street address..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Registering…' : 'Register Guardian'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Parents;
