import React, { useState } from 'react';
import {
  Check,
  X,
  Clock,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { AttendanceRecord } from '../types';
import {
  initialStudents,
  initialClasses,
  initialSections,
  initialAttendances,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { attendanceService } from '../api/attendanceService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const Attendance: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState('2026-10-19');
  const [selectedClass, setSelectedClass] = useState(2); // Grade 10
  const [selectedSection, setSelectedSection] = useState(3); // Section A

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() =>
    getStoredData('attendance_records', initialAttendances)
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch live attendance on filter change
  React.useEffect(() => {
    attendanceService
      .getAttendance({
        date: selectedDate,
        class_id: selectedClass,
        section_id: selectedSection,
      })
      .then((records) => {
        if (records && records.length > 0) {
          setAttendances((prev) => {
            const map = new Map(prev.map((r) => [`${r.student_profile_id}-${r.date}`, r]));
            records.forEach((rec: any) => {
              map.set(`${rec.student_profile_id}-${rec.date}`, rec);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => {
        console.warn('Backend attendance fetch error, using local data:', err);
      });
  }, [selectedDate, selectedClass, selectedSection]);

  // Filter students for chosen class & section
  const currentClassStudents = initialStudents.filter(
    (s) => s.current_class_id === selectedClass && s.current_section_id === selectedSection
  );

  // Get current status for student on selectedDate
  const getStudentStatus = (studentId: number): AttendanceRecord['status'] => {
    const record = attendances.find(
      (a) =>
        a.student_profile_id === studentId &&
        a.school_class_id === selectedClass &&
        a.section_id === selectedSection &&
        a.date === selectedDate
    );
    return record?.status || 'present';
  };

  const getStudentRemarks = (studentId: number): string => {
    const record = attendances.find(
      (a) =>
        a.student_profile_id === studentId &&
        a.school_class_id === selectedClass &&
        a.section_id === selectedSection &&
        a.date === selectedDate
    );
    return record?.remarks || '';
  };

  const setStatus = (studentId: number, status: AttendanceRecord['status']) => {
    const existingIndex = attendances.findIndex(
      (a) =>
        a.student_profile_id === studentId &&
        a.school_class_id === selectedClass &&
        a.section_id === selectedSection &&
        a.date === selectedDate
    );

    let updated = [...attendances];
    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
      };
    } else {
      updated.push({
        id: Date.now() + Math.random(),
        student_profile_id: studentId,
        school_class_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate,
        status,
      });
    }

    setAttendances(updated);
    saveStoredData('attendance_records', updated);
  };

  const updateRemarks = (studentId: number, remarks: string) => {
    const existingIndex = attendances.findIndex(
      (a) =>
        a.student_profile_id === studentId &&
        a.school_class_id === selectedClass &&
        a.section_id === selectedSection &&
        a.date === selectedDate
    );

    let updated = [...attendances];
    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        remarks,
      };
    } else {
      updated.push({
        id: Date.now() + Math.random(),
        student_profile_id: studentId,
        school_class_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate,
        status: 'present',
        remarks,
      });
    }

    setAttendances(updated);
    saveStoredData('attendance_records', updated);
  };

  const markAllPresent = () => {
    let updated = [...attendances];
    currentClassStudents.forEach((student) => {
      const idx = updated.findIndex(
        (a) =>
          a.student_profile_id === student.id &&
          a.school_class_id === selectedClass &&
          a.section_id === selectedSection &&
          a.date === selectedDate
      );
      if (idx >= 0) {
        updated[idx].status = 'present';
      } else {
        updated.push({
          id: Date.now() + Math.random(),
          student_profile_id: student.id,
          school_class_id: selectedClass,
          section_id: selectedSection,
          date: selectedDate,
          status: 'present',
        });
      }
    });
    setAttendances(updated);
    saveStoredData('attendance_records', updated);
  };

  const handleSaveAttendance = async () => {
    try {
      const recordsToCommit = currentClassStudents.map((s) => ({
        student_profile_id: s.id,
        status: getStudentStatus(s.id),
        remarks: getStudentRemarks(s.id) || undefined,
      }));

      await attendanceService.recordAttendance({
        school_class_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate,
        records: recordsToCommit,
      });
    } catch (err) {
      console.warn('Backend attendance commit error, saved locally:', err);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Stats for the day
  const presentCount = currentClassStudents.filter((s) => getStudentStatus(s.id) === 'present').length;
  const absentCount = currentClassStudents.filter((s) => getStudentStatus(s.id) === 'absent').length;
  const lateCount = currentClassStudents.filter((s) => getStudentStatus(s.id) === 'late').length;
  const excusedCount = currentClassStudents.filter((s) => getStudentStatus(s.id) === 'excused').length;
  const attendanceRate =
    currentClassStudents.length > 0 ? Math.round((presentCount / currentClassStudents.length) * 100) : 100;

  if (currentRole === 'student' || currentRole === 'parent') {
    const studentRecords = attendances.filter((a) => a.student_profile_id === 1);
    const totalRecorded = studentRecords.length > 0 ? studentRecords.length : 30;
    const presentCount = studentRecords.filter((a) => a.status === 'present').length || 29;
    const absentCount = studentRecords.filter((a) => a.status === 'absent').length || 1;
    const rate = Math.round((presentCount / totalRecorded) * 100);

    return (
      <div id="student-attendance-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {currentRole === 'parent' ? "Child's Attendance Report" : 'My Attendance History'}
            </h1>
            <p className="page-subtitle">
              {currentRole === 'parent'
                ? 'Monitoring attendance records and absence history for Liam Reynolds (Grade 10-A)'
                : `Verified personal attendance ledger and compliance records for ${currentUser.name}`}
            </p>
          </div>
          <div className="page-actions">
            <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Overall Compliance: {rate}%
            </span>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Days Tracked</span>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                <Clock size={20} />
              </div>
            </div>
            <div className="stat-value">{totalRecorded}</div>
            <div className="stat-trend">Academic Session 2025-2026</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Days Present</span>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Check size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{presentCount}</div>
            <div className="stat-trend trend-up">On schedule & active</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Absences</span>
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <X size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{absentCount}</div>
            <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>1 excused medical absence</div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Clock size={18} style={{ color: 'var(--primary)' }} /> Attendance Register Timeline
            </h2>
            <span className="badge badge-info">Grade 10 - Section A</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Class & Section</th>
                  <th>Attendance Status</th>
                  <th>Reason / Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentRecords.length > 0 ? (
                  studentRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td><strong>{rec.date}</strong></td>
                      <td>Grade 10 - Section A</td>
                      <td><StatusBadge status={rec.status} /></td>
                      <td style={{ color: 'var(--text-muted)' }}>{rec.remarks || 'Regular daily check-in verified'}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td><strong>2026-10-19</strong></td>
                      <td>Grade 10 - Section A</td>
                      <td><StatusBadge status="present" /></td>
                      <td style={{ color: 'var(--text-muted)' }}>On time morning roll call</td>
                    </tr>
                    <tr>
                      <td><strong>2026-10-18</strong></td>
                      <td>Grade 10 - Section A</td>
                      <td><StatusBadge status="present" /></td>
                      <td style={{ color: 'var(--text-muted)' }}>Attended all lectures</td>
                    </tr>
                    <tr>
                      <td><strong>2026-10-17</strong></td>
                      <td>Grade 10 - Section A</td>
                      <td><StatusBadge status="excused" /></td>
                      <td style={{ color: 'var(--text-muted)' }}>Medical excuse submitted by guardian</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="attendance-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Student Attendance Register</h1>
          <p className="page-subtitle">
            Record and audit daily class attendance, reason codes for tardiness, and parental leave notices.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={markAllPresent}>
            <Check size={16} /> Mark All Present
          </button>
          <button className="btn btn-primary" onClick={handleSaveAttendance}>
            <Save size={16} /> Save Register
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            background: 'var(--success-bg)',
            color: 'var(--success)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} />
          Attendance register for {selectedDate} committed and stored successfully.
        </div>
      )}

      {/* Date & Class Selectors */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Class:</span>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {initialClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Section:</span>
            <select
              className="form-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {initialSections
                .filter((s) => s.school_class_id === selectedClass)
                .map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Present</span>
            <span className="badge badge-present">{presentCount} Students</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {attendanceRate}%
          </div>
          <div className="stat-trend trend-up">On schedule</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Absent</span>
            <span className="badge badge-absent">{absentCount} Students</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {absentCount}
          </div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>Unexcused absences</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Late Arrival</span>
            <span className="badge badge-late">{lateCount} Students</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {lateCount}
          </div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>Tardy records</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Excused Leave</span>
            <span className="badge badge-excused">{excusedCount} Students</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>
            {excusedCount}
          </div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>Approved slips</div>
        </div>
      </div>

      {/* Roster Attendance Table */}
      <div className="glass-panel" style={{ padding: '0.5rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Admission No</th>
                <th>Attendance Status</th>
                <th>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {currentClassStudents.map((student) => {
                const status = getStudentStatus(student.id);
                const remarks = getStudentRemarks(student.id);

                return (
                  <tr key={student.id}>
                    <td><strong>{student.roll_number || 'N/A'}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={student.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt=""
                          className="avatar-img"
                          style={{ width: '32px', height: '32px' }}
                        />
                        <span style={{ fontWeight: 700 }}>{student.user?.name}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>
                        {student.admission_number}
                      </code>
                    </td>
                    <td>
                      {/* 4 Status Choice Buttons */}
                      <div style={{ display: 'inline-flex', gap: '0.35rem', background: 'var(--bg-glass-strong)', padding: '0.2rem', borderRadius: 'var(--radius-full)' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${status === 'present' ? 'btn-success' : 'btn-secondary'}`}
                          style={{ borderRadius: 'var(--radius-full)', padding: '0.25rem 0.65rem' }}
                          onClick={() => setStatus(student.id, 'present')}
                        >
                          <Check size={12} /> Present
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${status === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ borderRadius: 'var(--radius-full)', padding: '0.25rem 0.65rem' }}
                          onClick={() => setStatus(student.id, 'absent')}
                        >
                          <X size={12} /> Absent
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${status === 'late' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            borderRadius: 'var(--radius-full)',
                            padding: '0.25rem 0.65rem',
                            background: status === 'late' ? 'var(--warning)' : undefined,
                            color: status === 'late' ? '#000' : undefined,
                          }}
                          onClick={() => setStatus(student.id, 'late')}
                        >
                          <Clock size={12} /> Late
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${status === 'excused' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            borderRadius: 'var(--radius-full)',
                            padding: '0.25rem 0.65rem',
                            background: status === 'excused' ? 'var(--info)' : undefined,
                          }}
                          onClick={() => setStatus(student.id, 'excused')}
                        >
                          <ShieldAlert size={12} /> Excused
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Optional note / medical leave..."
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                        value={remarks}
                        onChange={(e) => updateRemarks(student.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
