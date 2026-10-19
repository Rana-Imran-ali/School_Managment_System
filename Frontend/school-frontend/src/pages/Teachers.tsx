import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { TeacherProfile } from '../types';
import { initialTeachers, getStoredData, saveStoredData } from '../data/mockData';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { teacherService } from '../api/teacherService';

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() =>
    getStoredData('teachers_list', initialTeachers)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load live faculty from backend
  useEffect(() => {
    let isMounted = true;
    teacherService
      .getTeachers()
      .then((res) => {
        if (isMounted && res?.items && res.items.length > 0) {
          const liveTeachers: TeacherProfile[] = res.items.map((t: any) => ({
            id: t.id,
            user_id: t.user?.id || t.id,
            employee_id: t.employee_id,
            qualification: t.qualification || 'M.S. in Education',
            specialization: t.specialization || 'Instruction',
            joining_date: t.joining_date || '2024-08-15',
            salary: t.salary || 75000,
            bio: t.bio || 'Faculty Instructor',
            user: {
              id: t.user?.id || t.id,
              name: t.user?.name || 'Faculty Member',
              email: t.user?.email || 'teacher@educore.edu',
              phone: t.user?.phone || '',
              role: 'teacher',
              status: t.user?.status || 'active',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            },
          }));
          setTeachers(liveTeachers);
          saveStoredData('teachers_list', liveTeachers);
        }
      })
      .catch((err) => {
        console.warn('Backend teacher fetch failed, using cached data.', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: `EMP-T-${Math.floor(1000 + Math.random() * 9000)}`,
    qualification: 'M.S. in Education',
    specialization: 'Mathematics & Natural Sciences',
    salary: 78000,
    bio: 'Dedicated educator focused on experiential learning and student mentorship.',
  });

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const created = await teacherService.createTeacher({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        employee_id: formData.employee_id,
        qualification: formData.qualification,
        specialization: formData.specialization,
        salary: Number(formData.salary),
        bio: formData.bio,
      });

      if (created) {
        const mapped: TeacherProfile = {
          id: created.id,
          user_id: created.user?.id || created.id,
          employee_id: created.employee_id,
          qualification: created.qualification,
          specialization: created.specialization,
          joining_date: created.joining_date || new Date().toISOString().split('T')[0],
          salary: Number(created.salary),
          bio: created.bio,
          user: {
            id: created.user?.id || created.id,
            name: created.user?.name || formData.name,
            email: created.user?.email || formData.email,
            phone: created.user?.phone || formData.phone,
            role: 'teacher',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          },
        };
        const updated = [mapped, ...teachers];
        setTeachers(updated);
        saveStoredData('teachers_list', updated);
        setIsAddModalOpen(false);
        return;
      }
    } catch (err) {
      console.warn('Backend teacher creation error, saving locally:', err);
    }

    const newTeacher: TeacherProfile = {
      id: Date.now(),
      user_id: Date.now(),
      employee_id: formData.employee_id,
      qualification: formData.qualification,
      specialization: formData.specialization,
      joining_date: new Date().toISOString().split('T')[0],
      salary: Number(formData.salary),
      bio: formData.bio,
      user: {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'teacher',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
    };

    const updated = [newTeacher, ...teachers];
    setTeachers(updated);
    saveStoredData('teachers_list', updated);
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this faculty record?')) {
      try {
        await teacherService.deleteTeacher(id);
      } catch (err) {
        console.warn('Backend delete error, removing locally:', err);
      }
      const updated = teachers.filter((t) => t.id !== id);
      setTeachers(updated);
      saveStoredData('teachers_list', updated);
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="teachers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty & Staff Directory</h1>
          <p className="page-subtitle">
            Manage academic instructors, qualifications, payroll tiers, and department assignments.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            id="btn-add-teacher"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Appoint Faculty Member
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search faculty by name, employee ID, or specialization..."
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
                <th>Faculty</th>
                <th>Employee ID</th>
                <th>Qualification</th>
                <th>Specialization</th>
                <th>Compensation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={teacher.user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                        alt=""
                        className="avatar-img"
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{teacher.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teacher.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--primary)' }}>
                      {teacher.employee_id}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{teacher.qualification}</td>
                  <td>
                    <span className="badge badge-info">{teacher.specialization}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    ${teacher.salary?.toLocaleString()}/yr
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{teacher.joining_date}</td>
                  <td>
                    <StatusBadge status={teacher.user?.status || 'active'} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      title="Remove Faculty"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Appoint New Faculty Member"
        maxWidth="640px"
      >
        <form onSubmit={handleCreateTeacher}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Dr. Eleanor Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Work Email *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="faculty@educore.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Contact</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Highest Qualification *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ph.D. in Physics"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization Subject *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Computational Physics"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Annual Salary ($ USD) *</label>
              <input
                type="number"
                required
                className="form-input"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Biography & Background</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Appoint & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
