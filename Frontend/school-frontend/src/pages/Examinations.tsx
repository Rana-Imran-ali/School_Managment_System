import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Layers,
  Plus,
  Save,
  Printer,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import type { Exam, Grade, ExamResult } from '../types';
import {
  initialExams,
  initialGrades,
  initialExamResults,
  initialStudents,
  initialSubjects,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { Modal } from '../components/Modal';
import { examService } from '../api/examService';
import { useAuth } from '../context/AuthContext';

export const Examinations: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'exams' | 'grades' | 'marks' | 'report'>(
    currentRole === 'student' || currentRole === 'parent' ? 'report' : 'exams'
  );

  const [exams, setExams] = useState<Exam[]>(() => getStoredData('exams_list', initialExams));
  const [grades, setGrades] = useState<Grade[]>(() => getStoredData('grades_list', initialGrades));
  const [results, setResults] = useState<ExamResult[]>(() =>
    getStoredData('exam_results_data', initialExamResults)
  );

  // Load live exams and grades from backend
  React.useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      examService.getExams(),
      examService.getGrades(),
      examService.getResults(),
    ]).then(([exRes, grRes, resRes]) => {
      if (!isMounted) return;

      if (exRes.status === 'fulfilled' && exRes.value && exRes.value.length > 0) {
        setExams(exRes.value);
        saveStoredData('exams_list', exRes.value);
      }
      if (grRes.status === 'fulfilled' && grRes.value && grRes.value.length > 0) {
        setGrades(grRes.value);
        saveStoredData('grades_list', grRes.value);
      }
      if (resRes.status === 'fulfilled' && resRes.value && resRes.value.length > 0) {
        setResults(resRes.value);
        saveStoredData('exam_results_data', resRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    start_date: '2026-11-15',
    end_date: '2026-11-22',
    term: 'First Semester',
  });

  // Marks Entry state
  const [selectedExamId, setSelectedExamId] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState(1);
  const [marksState, setMarksState] = useState<{ [studentId: number]: { marks: number; remarks: string } }>({
    1: { marks: 94, remarks: 'Exceptional proofs' },
    2: { marks: 96, remarks: 'Top score in class' },
    3: { marks: 78, remarks: 'Good attempt' },
    4: { marks: 82, remarks: 'Steady improvement' },
  });
  const [marksSaved, setMarksSaved] = useState(false);

  // Report Card selection
  const [selectedReportStudentId, setSelectedReportStudentId] = useState(1);

  const calculateGrade = (mark: number): string => {
    const match = grades.find((g) => mark >= g.min_mark && mark <= g.max_mark);
    return match ? match.name : 'N/A';
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: Exam = {
      id: Date.now(),
      name: examForm.name,
      academic_year_id: 1,
      start_date: examForm.start_date,
      end_date: examForm.end_date,
      term: examForm.term,
    };
    const updated = [...exams, newExam];
    setExams(updated);
    saveStoredData('exams_list', updated);
    setIsExamModalOpen(false);
  };

  const handleSaveMarks = () => {
    let updatedResults = [...results];

    initialStudents.forEach((student) => {
      const entry = marksState[student.id];
      if (entry) {
        const mark = Number(entry.marks) || 0;
        const letter = calculateGrade(mark);

        const idx = updatedResults.findIndex(
          (r) =>
            r.exam_id === selectedExamId &&
            r.subject_id === selectedSubjectId &&
            r.student_profile_id === student.id
        );

        if (idx >= 0) {
          updatedResults[idx] = {
            ...updatedResults[idx],
            marks_obtained: mark,
            grade: letter,
            remarks: entry.remarks,
          };
        } else {
          updatedResults.push({
            id: Date.now() + Math.random(),
            exam_id: selectedExamId,
            student_profile_id: student.id,
            subject_id: selectedSubjectId,
            marks_obtained: mark,
            total_marks: 100,
            grade: letter,
            remarks: entry.remarks,
          });
        }
      }
    });

    setResults(updatedResults);
    saveStoredData('exam_results_data', updatedResults);
    setMarksSaved(true);
    setTimeout(() => setMarksSaved(false), 3000);
  };

  const reportStudent = initialStudents.find((s) => s.id === selectedReportStudentId) || initialStudents[0];
  const studentResults = results.filter((r) => r.student_profile_id === reportStudent.id);

  return (
    <div id="examinations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Examinations & Academic Grading</h1>
          <p className="page-subtitle">
            Configure examination timetables, grading rubrics, batch score entry, and print report cards.
          </p>
        </div>
      </div>

      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <Calendar size={16} /> Examination Schedules
        </button>
        {currentRole === 'admin' && (
          <button
            className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
          >
            <Layers size={16} /> Grading Scale Rubric
          </button>
        )}
        {(currentRole === 'admin' || currentRole === 'teacher') && (
          <button
            className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
            onClick={() => setActiveTab('marks')}
          >
            <Award size={16} /> Marks Entry Sheet
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <FileCheck size={16} /> {currentRole === 'student' ? 'My Report Card' : currentRole === 'parent' ? "Child's Report Card" : 'Student Report Card'}
        </button>
      </div>

      {/* TAB 1: Examination Schedules */}
      {activeTab === 'exams' && (
        <div>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setIsExamModalOpen(true)}>
                <Plus size={16} /> Schedule Examination
              </button>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examination Title</th>
                  <th>Academic Term</th>
                  <th>Commencement Date</th>
                  <th>Conclusion Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exam.name}</td>
                    <td><span className="badge badge-info">{exam.term}</span></td>
                    <td>{exam.start_date}</td>
                    <td>{exam.end_date}</td>
                    <td><span className="badge badge-active">Scheduled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Grading Scale */}
      {activeTab === 'grades' && (
        <div className="glass-panel" style={{ padding: '0.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Grade Letter</th>
                <th>Minimum Mark</th>
                <th>Maximum Mark</th>
                <th>GPA Point</th>
                <th>Performance Description</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                      }}
                    >
                      {g.name}
                    </span>
                  </td>
                  <td><strong>{g.min_mark}%</strong></td>
                  <td><strong>{g.max_mark}%</strong></td>
                  <td><code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{g.grade_point.toFixed(1)}</code></td>
                  <td style={{ color: 'var(--text-muted)' }}>{g.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Marks Entry Sheet */}
      {activeTab === 'marks' && (
        <div>
          <div className="filter-bar">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Exam:</span>
                <select
                  className="form-select"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(Number(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Subject:</span>
                <select
                  className="form-select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {initialSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSaveMarks}>
              <Save size={16} /> Save Scores
            </button>
          </div>

          {marksSaved && (
            <div
              style={{
                background: 'var(--success-bg)',
                color: 'var(--success)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} />
              Evaluation marks submitted and grades computed successfully.
            </div>
          )}

          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Admission No</th>
                  <th style={{ width: '150px' }}>Marks Obtained (/100)</th>
                  <th>Calculated Grade</th>
                  <th>Teacher Remarks</th>
                </tr>
              </thead>
              <tbody>
                {initialStudents.map((student) => {
                  const currentScore = marksState[student.id]?.marks ?? 85;
                  const currentRemarks = marksState[student.id]?.remarks ?? '';
                  const letter = calculateGrade(currentScore);

                  return (
                    <tr key={student.id}>
                      <td><strong>{student.roll_number}</strong></td>
                      <td style={{ fontWeight: 700 }}>{student.user?.name}</td>
                      <td>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>
                          {student.admission_number}
                        </code>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontWeight: 700 }}
                          value={currentScore}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMarksState({
                              ...marksState,
                              [student.id]: {
                                ...marksState[student.id],
                                marks: val,
                                remarks: currentRemarks,
                              },
                            });
                          }}
                        />
                      </td>
                      <td>
                        <span className="badge badge-active" style={{ fontSize: '0.82rem' }}>
                          {letter}
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Commendation or improvement note..."
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                          value={currentRemarks}
                          onChange={(e) => {
                            setMarksState({
                              ...marksState,
                              [student.id]: {
                                ...marksState[student.id],
                                marks: currentScore,
                                remarks: e.target.value,
                              },
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Student Report Card */}
      {activeTab === 'report' && (
        <div>
          <div className="filter-bar">
            {(currentRole === 'admin' || currentRole === 'teacher') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Student:</span>
                <select
                  className="form-select"
                  value={selectedReportStudentId}
                  onChange={(e) => setSelectedReportStudentId(Number(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {initialStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.user?.name} ({st.admission_number})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print Report Card
            </button>
          </div>

          {/* Printable Report Card Sheet */}
          <div className="receipt-paper" style={{ maxWidth: '750px', marginTop: '1rem' }}>
            <div className="receipt-header">
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 700, color: '#6366f1' }}>
                EDUCORE ACADEMY OF EXCELLENCE
              </div>
              <h2 className="receipt-title">OFFICIAL STUDENT TRANSCRIPT</h2>
              <div className="receipt-sub">Academic Session 2025–2026 • Term 1 Evaluation</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem', margin: '1rem 0' }}>
              <div><strong>Student Name:</strong> {reportStudent.user?.name}</div>
              <div><strong>Roll Number:</strong> {reportStudent.roll_number}</div>
              <div><strong>Admission No:</strong> {reportStudent.admission_number}</div>
              <div><strong>Class & Section:</strong> Grade 10 - Section A</div>
            </div>

            <table className="receipt-details-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Subject</th>
                  <th>Maximum</th>
                  <th>Obtained</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((r) => {
                  const sub = initialSubjects.find((s) => s.id === r.subject_id);
                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>{sub?.name || 'Subject'}</td>
                      <td>100</td>
                      <td><strong>{r.marks_obtained}</strong></td>
                      <td><strong>{r.grade}</strong></td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Cumulative Grade Average:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>3.92 GPA (Honors)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #334155', width: '160px', marginBottom: '0.35rem' }}></div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dean of Academics Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Exam Modal */}
      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Schedule Examination Event">
        <form onSubmit={handleCreateExam}>
          <div className="form-group">
            <label className="form-label">Examination Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Q2 Benchmark Assessment"
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Commencement Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={examForm.start_date}
                onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Conclusion Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={examForm.end_date}
                onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Academic Term</label>
            <input
              type="text"
              className="form-input"
              value={examForm.term}
              onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
            />
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
