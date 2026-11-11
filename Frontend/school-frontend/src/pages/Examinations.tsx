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
  Trash2,
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

  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    name: 'A+',
    mark_from: 90,
    mark_to: 100,
    grade_point: 4.0,
    remarks: 'Outstanding',
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
  const [liveReportCard, setLiveReportCard] = useState<any>(null);
  const [isLoadingReportCard, setIsLoadingReportCard] = useState<boolean>(false);

  // Fetch student report card from backend
  React.useEffect(() => {
    if (activeTab === 'report') {
      setIsLoadingReportCard(true);
      examService
        .getStudentReportCard(selectedReportStudentId)
        .then((data) => {
          setLiveReportCard(data);
        })
        .catch((err) => {
          console.warn('Backend report card error, using local data:', err);
          setLiveReportCard(null);
        })
        .finally(() => {
          setIsLoadingReportCard(false);
        });
    }
  }, [selectedReportStudentId, activeTab]);

  const calculateGrade = (mark: number): string => {
    const match = grades.find((g: any) => {
      const min = g.min_mark ?? g.mark_from ?? 0;
      const max = g.max_mark ?? g.mark_to ?? 100;
      return mark >= min && mark <= max;
    });
    return match ? match.name : 'N/A';
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: examForm.name,
      academic_year_id: 1,
      start_date: examForm.start_date,
      end_date: examForm.end_date,
      term: examForm.term,
    };
    try {
      const created = await examService.createExam(payload);
      const newExam: Exam = created || { id: Date.now(), ...payload };
      const updated = [...exams, newExam];
      setExams(updated);
      saveStoredData('exams_list', updated);
    } catch (err) {
      console.warn('Backend exam create error, saving locally:', err);
      const newExam: Exam = { id: Date.now(), ...payload };
      const updated = [...exams, newExam];
      setExams(updated);
      saveStoredData('exams_list', updated);
    }
    setIsExamModalOpen(false);
  };

  const handleDeleteExam = async (id: number) => {
    if (!window.confirm('Delete this examination schedule?')) return;
    try {
      await examService.deleteExam(id);
    } catch (err) {
      console.warn('Backend exam delete error, removing locally:', err);
    }
    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    saveStoredData('exams_list', updated);
  };

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: gradeForm.name,
      mark_from: Number(gradeForm.mark_from),
      mark_to: Number(gradeForm.mark_to),
      grade_point: Number(gradeForm.grade_point),
      remarks: gradeForm.remarks,
    };
    try {
      const created = await examService.createGrade(payload);
      const newG = created || { id: Date.now(), ...payload, min_mark: payload.mark_from, max_mark: payload.mark_to };
      const updated = [...grades, newG];
      setGrades(updated);
      saveStoredData('grades_list', updated);
    } catch (err) {
      console.warn('Backend grade create error, saving locally:', err);
      const newG = { id: Date.now(), ...payload, min_mark: payload.mark_from, max_mark: payload.mark_to };
      const updated = [...grades, newG];
      setGrades(updated);
      saveStoredData('grades_list', updated);
    }
    setIsGradeModalOpen(false);
  };

  const handleDeleteGrade = async (id: number) => {
    if (!window.confirm('Delete this grade scale rubric?')) return;
    try {
      await examService.deleteGrade(id);
    } catch (err) {
      console.warn('Backend grade delete error, removing locally:', err);
    }
    const updated = grades.filter((g) => g.id !== id);
    setGrades(updated);
    saveStoredData('grades_list', updated);
  };

  const handleSaveMarks = async () => {
    const recordsToCommit = initialStudents
      .filter((student) => marksState[student.id])
      .map((student) => ({
        student_profile_id: student.id,
        marks_obtained: Number(marksState[student.id].marks) || 0,
        total_marks: 100,
        remarks: marksState[student.id].remarks || undefined,
      }));

    try {
      await examService.recordResults({
        exam_id: selectedExamId,
        subject_id: selectedSubjectId,
        results: recordsToCommit,
      });
    } catch (err) {
      console.warn('Backend marks record error, saving locally:', err);
    }

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
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
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
                    {currentRole === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Exam"
                          onClick={() => handleDeleteExam(exam.id)}
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

      {/* TAB 2: Grading Scale */}
      {activeTab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setIsGradeModalOpen(true)}>
                <Plus size={16} /> Add Grade Threshold
              </button>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Grade Letter</th>
                  <th>Minimum Mark</th>
                  <th>Maximum Mark</th>
                  <th>GPA Point</th>
                  <th>Performance Description</th>
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
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
                    <td><strong>{g.min_mark ?? (g as any).mark_from ?? 0}%</strong></td>
                    <td><strong>{g.max_mark ?? (g as any).mark_to ?? 100}%</strong></td>
                    <td><code style={{ fontSize: '0.85rem' }}>{(g as any).grade_point ?? (g as any).point ?? 4.0}</code></td>
                    <td style={{ color: 'var(--text-muted)' }}>{(g as any).description || (g as any).remarks || 'Consistent performance'}</td>
                    {currentRole === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Grade"
                          onClick={() => handleDeleteGrade(g.id)}
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
          {isLoadingReportCard ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
              Compiling academic transcript and loading GPA audit from server...
            </div>
          ) : (
            <div className="receipt-paper" style={{ maxWidth: '750px', marginTop: '1rem' }}>
              <div className="receipt-header">
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 700, color: '#6366f1' }}>
                  EDUCORE ACADEMY OF EXCELLENCE
                </div>
                <h2 className="receipt-title">OFFICIAL STUDENT TRANSCRIPT</h2>
                <div className="receipt-sub">Academic Session 2025–2026 • Term 1 Evaluation</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem', margin: '1rem 0' }}>
                <div><strong>Student Name:</strong> {liveReportCard?.student?.name || reportStudent.user?.name}</div>
                <div><strong>Roll Number:</strong> {liveReportCard?.student?.roll_number || reportStudent.roll_number}</div>
                <div><strong>Admission No:</strong> {liveReportCard?.student?.admission_number || reportStudent.admission_number}</div>
                <div><strong>Class & Section:</strong> {liveReportCard?.student?.class_name || 'Grade 10'} ({liveReportCard?.student?.section_name || 'Section A'})</div>
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
                  {(liveReportCard?.results && liveReportCard.results.length > 0
                    ? liveReportCard.results
                    : studentResults
                  ).map((r: any, i: number) => {
                    const subName = r.subject?.name || r.subject_name || initialSubjects.find((s) => s.id === r.subject_id)?.name || `Subject ${i + 1}`;
                    return (
                      <tr key={r.id || i}>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>{subName}</td>
                        <td>{r.total_marks || 100}</td>
                        <td><strong>{r.marks_obtained}</strong></td>
                        <td><strong>{r.grade}</strong></td>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.remarks || 'Satisfactory'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Cumulative Grade Average:</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    {liveReportCard?.summary?.gpa ? `GPA ${liveReportCard.summary.gpa} (${liveReportCard.summary.standing || 'Honors'})` : '3.92 GPA (Honors)'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #334155', width: '160px', marginBottom: '0.35rem' }}></div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dean of Academics Signature</div>
                </div>
              </div>
            </div>
          )}
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

      {/* Add Grade Scale Threshold Modal */}
      {isGradeModalOpen && (
        <Modal
          isOpen={isGradeModalOpen}
          onClose={() => setIsGradeModalOpen(false)}
          title="Create Grade Letter Rubric"
          maxWidth="500px"
        >
          <form onSubmit={handleCreateGrade}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade Letter *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. A+, B, C"
                  value={gradeForm.name}
                  onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GPA Point *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  className="form-input"
                  value={gradeForm.grade_point}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade_point: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Score (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="form-input"
                  value={gradeForm.mark_from}
                  onChange={(e) => setGradeForm({ ...gradeForm, mark_from: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Score (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="form-input"
                  value={gradeForm.mark_to}
                  onChange={(e) => setGradeForm({ ...gradeForm, mark_to: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Performance Descriptor</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mastery of subject with high distinction"
                value={gradeForm.remarks}
                onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsGradeModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Grade Rubric
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
