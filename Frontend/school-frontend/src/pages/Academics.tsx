import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Plus,
  GraduationCap,
  Trash2,
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
  const [sections, setSections] = useState(() => getStoredData('sections_list', initialSections));
  const [subjects, setSubjects] = useState(() => getStoredData('subjects_list', initialSubjects));
  const [periods, setPeriods] = useState(() => getStoredData('periods_list', initialPeriods));
  const [academicYears, setAcademicYears] = useState(() => getStoredData('years_list', initialAcademicYears));
  const [assignments, setAssignments] = useState(() => getStoredData('assignments_list', initialTeacherAssignments));

  // Load live data from backend
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      academicService.getClasses(),
      academicService.getSections(),
      academicService.getSubjects(),
      academicService.getPeriods(),
      academicService.getAcademicYears(),
      academicService.getTeacherAssignments(),
    ]).then(([clsRes, secRes, subRes, perRes, yrRes, assRes]) => {
      if (!isMounted) return;

      if (clsRes.status === 'fulfilled' && clsRes.value && clsRes.value.length > 0) {
        setClasses(clsRes.value);
        saveStoredData('classes_list', clsRes.value);
      }
      if (secRes.status === 'fulfilled' && secRes.value && secRes.value.length > 0) {
        setSections(secRes.value);
        saveStoredData('sections_list', secRes.value);
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
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  // Forms
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescInput, setClassDescInput] = useState('');

  const [sectionForm, setSectionForm] = useState({
    school_class_id: 2,
    name: 'A',
    capacity: 35,
  });

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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: classNameInput,
      numeric_value: parseInt(classNameInput.replace(/\D/g, '')) || 1,
      description: classDescInput,
    };
    try {
      const created = await academicService.createClass(payload);
      const newClass = created || { id: Date.now(), ...payload };
      const updated = [...classes, newClass];
      setClasses(updated);
      saveStoredData('classes_list', updated);
    } catch (err) {
      console.warn('Backend class create error, saving locally:', err);
      const newClass = { id: Date.now(), ...payload };
      const updated = [...classes, newClass];
      setClasses(updated);
      saveStoredData('classes_list', updated);
    }
    setClassNameInput('');
    setClassDescInput('');
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = async (id: number) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      await academicService.deleteClass(id);
    } catch (err) {
      console.warn('Backend class delete error, removing locally:', err);
    }
    const updated = classes.filter((c: any) => c.id !== id);
    setClasses(updated);
    saveStoredData('classes_list', updated);
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      school_class_id: Number(sectionForm.school_class_id),
      name: sectionForm.name,
      capacity: Number(sectionForm.capacity),
    };
    try {
      const created = await academicService.createSection(payload);
      const newSec = created || { id: Date.now(), ...payload };
      const updated = [...sections, newSec];
      setSections(updated);
      saveStoredData('sections_list', updated);
    } catch (err) {
      console.warn('Backend section create error, saving locally:', err);
      const newSec = { id: Date.now(), ...payload };
      const updated = [...sections, newSec];
      setSections(updated);
      saveStoredData('sections_list', updated);
    }
    setIsSectionModalOpen(false);
  };

  const handleDeleteSection = async (id: number) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await academicService.deleteSection(id);
    } catch (err) {
      console.warn('Backend section delete error, removing locally:', err);
    }
    const updated = sections.filter((s: any) => s.id !== id);
    setSections(updated);
    saveStoredData('sections_list', updated);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await academicService.createSubject(subjectForm);
      const newSub = created || { id: Date.now(), ...subjectForm };
      const updated = [...subjects, newSub];
      setSubjects(updated);
      saveStoredData('subjects_list', updated);
    } catch (err) {
      console.warn('Backend subject create error, saving locally:', err);
      const newSub = { id: Date.now(), ...subjectForm };
      const updated = [...subjects, newSub];
      setSubjects(updated);
      saveStoredData('subjects_list', updated);
    }
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await academicService.deleteSubject(id);
    } catch (err) {
      console.warn('Backend subject delete error, removing locally:', err);
    }
    const updated = subjects.filter((s: any) => s.id !== id);
    setSubjects(updated);
    saveStoredData('subjects_list', updated);
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await academicService.createPeriod(periodForm);
      const newPer = created || { id: Date.now(), ...periodForm };
      const updated = [...periods, newPer];
      setPeriods(updated);
      saveStoredData('periods_list', updated);
    } catch (err) {
      console.warn('Backend period create error, saving locally:', err);
      const newPer = { id: Date.now(), ...periodForm };
      const updated = [...periods, newPer];
      setPeriods(updated);
      saveStoredData('periods_list', updated);
    }
    setIsPeriodModalOpen(false);
  };

  const handleDeletePeriod = async (id: number) => {
    if (!window.confirm('Delete this schedule period?')) return;
    try {
      await academicService.deletePeriod(id);
    } catch (err) {
      console.warn('Backend period delete error, removing locally:', err);
    }
    const updated = periods.filter((p: any) => p.id !== id);
    setPeriods(updated);
    saveStoredData('periods_list', updated);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      teacher_profile_id: Number(assignmentForm.teacher_profile_id),
      school_class_id: Number(assignmentForm.school_class_id),
      section_id: Number(assignmentForm.section_id),
      subject_id: Number(assignmentForm.subject_id),
      academic_year_id: 1,
    };
    try {
      const created = await academicService.createTeacherAssignment(payload);
      const newAss = created || { id: Date.now(), ...payload };
      const updated = [...assignments, newAss];
      setAssignments(updated);
      saveStoredData('assignments_list', updated);
    } catch (err) {
      console.warn('Backend teacher assignment create error, saving locally:', err);
      const newAss = { id: Date.now(), ...payload };
      const updated = [...assignments, newAss];
      setAssignments(updated);
      saveStoredData('assignments_list', updated);
    }
    setIsAssignmentModalOpen(false);
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!window.confirm('Delete this workload assignment?')) return;
    try {
      await academicService.deleteTeacherAssignment(id);
    } catch (err) {
      console.warn('Backend assignment delete error, removing locally:', err);
    }
    const updated = assignments.filter((a: any) => a.id !== id);
    setAssignments(updated);
    saveStoredData('assignments_list', updated);
  };

  const toggleActiveYear = async (id: number) => {
    try {
      await academicService.setActiveAcademicYear(id);
    } catch (err) {
      console.warn('Backend active year error, saving locally:', err);
    }
    const updated = academicYears.map((y: any) => ({
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsSectionModalOpen(true)}>
                <Plus size={16} /> Add Section to Class
              </button>
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
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {classes.map((cls: any) => {
                  const classSections = sections.filter((s: any) => s.school_class_id === cls.id);
                  return (
                    <tr key={cls.id}>
                      <td style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {cls.name}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{cls.description || 'General Curriculum'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {classSections.map((sec: any) => (
                            <span
                              key={sec.id}
                              className="badge badge-info"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              Section {sec.name}
                              {currentRole === 'admin' && (
                                <button
                                  type="button"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    color: 'inherit',
                                    opacity: 0.7,
                                  }}
                                  title="Delete section"
                                  onClick={() => handleDeleteSection(sec.id)}
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {classSections.map((s: any) => `Sec ${s.name}: ${s.capacity || 30} seats`).join(', ')}
                      </td>
                      {currentRole === 'admin' && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Class"
                            onClick={() => handleDeleteClass(cls.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
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
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub: any) => (
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
                    {currentRole === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Subject"
                          onClick={() => handleDeleteSubject(sub.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
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
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {periods.map((p: any) => (
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
                    {currentRole === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Period"
                          onClick={() => handleDeletePeriod(p.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
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
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.map((ass: any) => {
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
                      {currentRole === 'admin' && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Assignment"
                            onClick={() => handleDeleteAssignment(ass.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
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

      {/* Add Section to Class Modal */}
      {isSectionModalOpen && (
        <Modal
          isOpen={isSectionModalOpen}
          onClose={() => setIsSectionModalOpen(false)}
          title="Create New Classroom Section"
          maxWidth="480px"
        >
          <form onSubmit={handleCreateSection}>
            <div className="form-group">
              <label className="form-label">Assign to Class / Grade *</label>
              <select
                className="form-select"
                value={sectionForm.school_class_id}
                onChange={(e) => setSectionForm({ ...sectionForm, school_class_id: Number(e.target.value) })}
              >
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Section Identifier *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. A, B, C, Gold"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Student Capacity</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  className="form-input"
                  value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsSectionModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Section
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
