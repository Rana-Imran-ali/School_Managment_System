import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
} from 'lucide-react';
import type { StudentProfile } from '../types';
import {
  initialStudents,
  initialClasses,
  initialSections,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

import { studentService } from '../api/studentService';
import { useAuth } from '../context/AuthContext';

export const Students: React.FC = () => {
  const { currentRole } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>(() =>
    getStoredData('students_list', initialStudents)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load live students from backend on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    studentService
      .getStudents()
      .then((res) => {
        if (isMounted && res?.items && res.items.length > 0) {
          const liveList: StudentProfile[] = res.items.map((item: any) => ({
            id: item.id,
            user_id: item.user?.id || item.id,
            admission_number: item.admission_number,
            roll_number: item.roll_number,
            admission_date: item.admission_date || '2026-09-01',
            blood_group: item.blood_group,
            religion: item.religion,
            current_class_id: item.school_class?.id,
            current_section_id: item.section?.id,
            school_class: item.school_class,
            section: item.section,
            user: {
              id: item.user?.id || item.id,
              name: item.user?.name || item.name,
              email: item.user?.email || item.email,
              phone: item.user?.phone || item.phone,
              role: 'student',
              gender: item.user?.gender || 'male',
              date_of_birth: item.user?.date_of_birth,
              address: item.user?.address,
              status: item.user?.status || 'active',
              avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
            },
          }));
          setStudents(liveList);
          saveStoredData('students_list', liveList);
        }
      })
      .catch((err) => {
        console.warn('Backend student list could not be retrieved, using cached data.', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    date_of_birth: '2009-05-15',
    admission_number: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
    roll_number: '10-A-05',
    current_class_id: 2,
    current_section_id: 3,
    blood_group: 'O+',
    religion: 'None',
    address: '452 California St, San Francisco, CA',
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const created = await studentService.createStudent({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        admission_number: formData.admission_number,
        roll_number: formData.roll_number,
        current_class_id: Number(formData.current_class_id),
        current_section_id: Number(formData.current_section_id),
        blood_group: formData.blood_group,
        religion: formData.religion,
        address: formData.address,
      });

      if (created) {
        const mappedCreated: StudentProfile = {
          id: created.id,
          user_id: created.user?.id || created.id,
          admission_number: created.admission_number,
          roll_number: created.roll_number,
          admission_date: created.admission_date || new Date().toISOString().split('T')[0],
          blood_group: created.blood_group,
          religion: created.religion,
          current_class_id: created.school_class?.id,
          current_section_id: created.section?.id,
          school_class: created.school_class,
          section: created.section,
          user: {
            id: created.user?.id || created.id,
            name: created.user?.name || formData.name,
            email: created.user?.email || formData.email,
            phone: created.user?.phone || formData.phone,
            role: 'student',
            gender: formData.gender as any,
            date_of_birth: formData.date_of_birth,
            address: formData.address,
            status: 'active',
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          },
        };

        const updated = [mappedCreated, ...students];
        setStudents(updated);
        saveStoredData('students_list', updated);
        setIsAddModalOpen(false);
        return;
      }
    } catch (err) {
      console.warn('Backend admission failed, falling back to local state:', err);
    }

    const newStudent: StudentProfile = {
      id: Date.now(),
      user_id: Date.now(),
      admission_number: formData.admission_number,
      roll_number: formData.roll_number,
      admission_date: new Date().toISOString().split('T')[0],
      blood_group: formData.blood_group,
      religion: formData.religion,
      current_class_id: Number(formData.current_class_id),
      current_section_id: Number(formData.current_section_id),
      school_class: initialClasses.find((c) => c.id === Number(formData.current_class_id)),
      section: initialSections.find((s) => s.id === Number(formData.current_section_id)),
      user: {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'student',
        gender: formData.gender as 'male' | 'female',
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        status: 'active',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      },
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStoredData('students_list', updated);
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this student record?')) {
      try {
        await studentService.deleteStudent(id);
      } catch (err) {
        console.warn('Backend delete error, removing from local state:', err);
      }
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      saveStoredData('students_list', updated);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === 'all' || s.current_class_id?.toString() === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div id="students-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Information System</h1>
          <p className="page-subtitle">
            Manage student enrollments, profiles, guardian linkages, and academic records.
          </p>
        </div>
        {currentRole === 'admin' && (
          <div className="page-actions">
            <button
              className="btn btn-primary"
              id="btn-open-add-student"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} /> New Student Admission
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            id="search-student-input"
            placeholder="Search student by name, admission no, or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            id="class-filter-select"
            style={{ width: 'auto' }}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            {initialClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-panel" style={{ padding: '0.5rem' }}>
        <div className="table-responsive">
          <table className="data-table" id="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Roll No</th>
                <th>Class & Section</th>
                <th>Contact</th>
                <th>Blood Group</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading student records...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={student.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt=""
                          className="avatar-img"
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{student.user?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--primary)' }}>
                        {student.admission_number}
                      </code>
                    </td>
                    <td><strong>{student.roll_number || 'N/A'}</strong></td>
                    <td>
                      <span className="badge badge-info">
                        {student.school_class?.name || 'Grade 10'} - Sec {student.section?.name || 'A'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {student.user?.phone || '+1 (555) 000-0000'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{student.blood_group || 'O+'}</span>
                    </td>
                    <td>
                      <StatusBadge status={student.user?.status || 'active'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="View Profile Details"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Eye size={14} />
                        </button>
                        {currentRole === 'admin' && (
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Student"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Add New Student Admission Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Student Admission & Registration"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateStudent}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Mason Hayes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="student@educore.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Admission Number *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.admission_number}
                onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class Roll Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="10-A-05"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Enrolled Class *</label>
              <select
                className="form-select"
                value={formData.current_class_id}
                onChange={(e) => setFormData({ ...formData, current_class_id: Number(e.target.value) })}
              >
                {initialClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section *</label>
              <select
                className="form-select"
                value={formData.current_section_id}
                onChange={(e) => setFormData({ ...formData, current_section_id: Number(e.target.value) })}
              >
                {initialSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name} (Class {s.school_class_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-student">
              Confirm & Enroll
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Profile Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Dossier: ${selectedStudent.user?.name}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-glass-strong)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <img
                src={selectedStudent.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt=""
                style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedStudent.user?.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Admission: <strong style={{ color: 'var(--primary)' }}>{selectedStudent.admission_number}</strong> • Roll: {selectedStudent.roll_number}
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <StatusBadge status={selectedStudent.user?.status || 'active'} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLASS PLACEMENT</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {selectedStudent.school_class?.name || 'Grade 10'} (Section {selectedStudent.section?.name || 'A'})
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>GUARDIAN / PARENT</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  David Reynolds (Father)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>{selectedStudent.user?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} />
                <span>{selectedStudent.user?.phone || '+1 (555) 441-9082'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>{selectedStudent.user?.address || '320 Highland Park Way, San Francisco, CA'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Heart size={16} style={{ color: 'var(--danger)' }} />
                <span>Blood Group: {selectedStudent.blood_group || 'O+'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Calendar size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Admission Date: {selectedStudent.admission_date || '2024-08-10'}</span>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
