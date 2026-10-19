import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Plus,
  GraduationCap,
} from 'lucide-react';
import {
  initialClasses,
  initialSections,
  initialSubjects,
  initialPeriods,
  initialAcademicYears,
  initialTeacherAssignments,
  initialTeachers,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { Modal } from '../components/Modal';
import { academicService } from '../api/academicService';
import { useAuth } from '../context/AuthContext';

export const Academics: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'periods' | 'years' | 'assignments'>('classes');

  // State
  const [classes, setClasses] = useState(() => getStoredData('classes_list', initialClasses));
  const [sections] = useState(() => getStoredData('sections_list', initialSections));
  const [subjects, setSubjects] = useState(() => getStoredData('subjects_list', initialSubjects));
  const [periods, setPeriods] = useState(() => getStoredData('periods_list', initialPeriods));
  const [academicYears, setAcademicYears] = useState(() => getStoredData('years_list', initialAcademicYears));
  const [assignments, setAssignments] = useState(() => getStoredData('assignments_list', initialTeacherAssignments));

  // Load live data from backend
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      academicService.getClasses(),
      academicService.getSubjects(),
      academicService.getPeriods(),
      academicService.getAcademicYears(),
      academicService.getTeacherAssignments(),
    ]).then(([clsRes, subRes, perRes, yrRes, assRes]) => {
      if (!isMounted) return;

      if (clsRes.status === 'fulfilled' && clsRes.value && clsRes.value.length > 0) {
        setClasses(clsRes.value);
        saveStoredData('classes_list', clsRes.value);
      }
      if (subRes.status === 'fulfilled' && subRes.value && subRes.value.length > 0) {
        setSubjects(subRes.value);
        saveStoredData('subjects_list', subRes.value);
      }
      if (perRes.status === 'fulfilled' && perRes.value && perRes.value.length > 0) {
        setPeriods(perRes.value);
        saveStoredData('periods_list', perRes.value);
      }
      if (yrRes.status === 'fulfilled' && yrRes.value && yrRes.value.length > 0) {
        setAcademicYears(yrRes.value);
        saveStoredData('years_list', yrRes.value);
      }
      if (assRes.status === 'fulfilled' && assRes.value && assRes.value.length > 0) {
        setAssignments(assRes.value);
        saveStoredData('assignments_list', assRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Forms
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescInput, setClassDescInput] = useState('');

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    type: 'core' as 'core' | 'elective' | 'practical',
    description: '',
  });

  const [periodForm, setPeriodForm] = useState({
    name: '',
    start_time: '09:00',
    end_time: '09:50',
    is_break: false,
  });

  const [assignmentForm, setAssignmentForm] = useState({
    teacher_profile_id: 1,
    school_class_id: 2,
    section_id: 3,
    subject_id: 1,
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass = {
      id: Date.now(),
      name: classNameInput,
      numeric_value: parseInt(classNameInput.replace(/\D/g, '')) || 1,
      description: classDescInput,
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    saveStoredData('classes_list', updated);
    setClassNameInput('');
    setClassDescInput('');
    setIsClassModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub = {
      id: Date.now(),
      ...subjectForm,
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveStoredData('subjects_list', updated);
    setIsSubjectModalOpen(false);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const newPer = {
      id: Date.now(),
      ...periodForm,
    };
    const updated = [...periods, newPer];
    setPeriods(updated);
    saveStoredData('periods_list', updated);
    setIsPeriodModalOpen(false);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAss = {
      id: Date.now(),
      teacher_profile_id: Number(assignmentForm.teacher_profile_id),
      school_class_id: Number(assignmentForm.school_class_id),
      section_id: Number(assignmentForm.section_id),
      subject_id: Number(assignmentForm.subject_id),
      academic_year_id: 1,
    };
    const updated = [...assignments, newAss];
    setAssignments(updated);
    saveStoredData('assignments_list', updated);
    setIsAssignmentModalOpen(false);
  };

  const toggleActiveYear = (id: number) => {
    const updated = academicYears.map((y) => ({
      ...y,
      is_current: y.id === id,
    }));
    setAcademicYears(updated);
    saveStoredData('years_list', updated);
  };

  return (
    <div id="academics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Structure & Configurations</h1>
          <p className="page-subtitle">
            Configure school grades, sections, subject catalogs, daily bell schedule, and faculty workloads.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <Layers size={16} /> Classes & Sections
        </button>
        <button
          className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <BookOpen size={16} /> Subjects Catalog
        </button>
        <button
          className={`tab-btn ${activeTab === 'periods' ? 'active' : ''}`}
          onClick={() => setActiveTab('periods')}
        >
          <Clock size={16} /> Periods & Bell Schedule
        </button>
        <button
          className={`tab-btn ${activeTab === 'years' ? 'active' : ''}`}
          onClick={() => setActiveTab('years')}
        >
          <Calendar size={16} /> Academic Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <GraduationCap size={16} /> Teacher Allocations
        </button>
      </div>

      {/* TAB 1: Classes & Sections */}
      {activeTab === 'classes' && (
        <div>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setIsClassModalOpen(true)}>
                <Plus size={16} /> Add Grade / Class
              </button>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class / Grade Level</th>
                  <th>Description</th>
                  <th>Allocated Sections</th>
                  <th>Section Capacities</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const classSections = sections.filter((s) => s.school_class_id === cls.id);
                  return (
                    <tr key={cls.id}>
                      <td style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {cls.name}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{cls.description || 'General Curriculum'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {classSections.map((sec) => (
                            <span key={sec.id} className="badge badge-info">
                              Section {sec.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {classSections.map((s) => `Sec ${s.name}: ${s.capacity} seats`).join(', ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Subjects */}
      {activeTab === 'subjects' && (
        <div>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setIsSubjectModalOpen(true)}>
                <Plus size={16} /> Register Subject
              </button>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Course Category</th>
                  <th>Curriculum Description</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                        {sub.code}
                      </code>
                    </td>
                    <td style={{ fontWeight: 700 }}>{sub.name}</td>
                    <td>
                      <span className={`badge ${sub.type === 'core' ? 'badge-active' : 'badge-pending'}`}>
                        {sub.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{sub.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Periods */}
      {activeTab === 'periods' && (
        <div>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setIsPeriodModalOpen(true)}>
                <Plus size={16} /> Add Daily Time Slot
              </button>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period Label</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td><code style={{ fontFamily: 'var(--font-mono)' }}>{p.start_time}</code></td>
                    <td><code style={{ fontFamily: 'var(--font-mono)' }}>{p.end_time}</code></td>
                    <td>
                      {p.is_break ? (
                        <span className="badge badge-pending">Recess / Break</span>
                      ) : (
                        <span className="badge badge-active">Lecture Period</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Academic Years */}
      {activeTab === 'years' && (
        <div>
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {academicYears.map((yr) => (
                  <tr key={yr.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{yr.name}</td>
                    <td>{yr.start_date}</td>
                    <td>{yr.end_date}</td>
                    <td>
                      {yr.is_current ? (
                        <span className="badge badge-active">Active Academic Year</span>
                      ) : (
                        <span className="badge badge-inactive">Archived</span>
                      )}
                    </td>
                    <td>
                      {!yr.is_current && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleActiveYear(yr.id)}
                        >
                          Set as Current
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Teacher Allocations */}
      {activeTab === 'assignments' && (
        <div>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setIsAssignmentModalOpen(true)}>
                <Plus size={16} /> Allocate Teacher to Class
              </button>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Assigned Subject</th>
                  <th>Class & Section</th>
                  <th>Academic Session</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((ass) => {
                  const teacher = initialTeachers.find((t) => t.id === ass.teacher_profile_id);
                  const sub = subjects.find((s) => s.id === ass.subject_id);
                  const cls = classes.find((c) => c.id === ass.school_class_id);
                  const sec = sections.find((s) => s.id === ass.section_id);

                  return (
                    <tr key={ass.id}>
                      <td style={{ fontWeight: 700 }}>{teacher?.user?.name || 'Dr. Sarah Jenkins'}</td>
                      <td>
                        <span className="badge badge-info">{sub?.name || 'Mathematics'}</span>
                      </td>
                      <td>
                        {cls?.name || 'Grade 10'} - Section {sec?.name || 'A'}
                      </td>
                      <td>2025-2026</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Register New Grade / Class">
        <form onSubmit={handleCreateClass}>
          <div className="form-group">
            <label className="form-label">Grade / Class Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Grade 11"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Curriculum Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="Junior High School Curriculum"
              value={classDescInput}
              onChange={(e) => setClassDescInput(e.target.value)}
            />
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Class
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Register New Subject">
        <form onSubmit={handleCreateSubject}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Biology & Anatomy"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="BIO-201"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={subjectForm.type}
              onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as any })}
            >
              <option value="core">Core Subject</option>
              <option value="elective">Elective Subject</option>
              <option value="practical">Practical / Lab</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
            />
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Subject
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPeriodModalOpen} onClose={() => setIsPeriodModalOpen(false)} title="Add Daily Time Slot">
        <form onSubmit={handleCreatePeriod}>
          <div className="form-group">
            <label className="form-label">Period Label *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Period 7"
              value={periodForm.name}
              onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                required
                className="form-input"
                value={periodForm.start_time}
                onChange={(e) => setPeriodForm({ ...periodForm, start_time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                required
                className="form-input"
                value={periodForm.end_time}
                onChange={(e) => setPeriodForm({ ...periodForm, end_time: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={periodForm.is_break}
                onChange={(e) => setPeriodForm({ ...periodForm, is_break: e.target.checked })}
              />
              <span style={{ fontSize: '0.88rem' }}>Is Break / Recess Period</span>
            </label>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPeriodModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Slot
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} title="Allocate Teacher">
        <form onSubmit={handleCreateAssignment}>
          <div className="form-group">
            <label className="form-label">Select Teacher *</label>
            <select
              className="form-select"
              value={assignmentForm.teacher_profile_id}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, teacher_profile_id: Number(e.target.value) })}
            >
              {initialTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.name} ({t.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Select Subject *</label>
            <select
              className="form-select"
              value={assignmentForm.subject_id}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: Number(e.target.value) })}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={assignmentForm.school_class_id}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, school_class_id: Number(e.target.value) })}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={assignmentForm.section_id}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, section_id: Number(e.target.value) })}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignmentModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
