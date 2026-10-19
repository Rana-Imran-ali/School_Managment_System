import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  initialStudents,
  initialTeachers,
  initialClasses,
  initialFeePayments,
  initialAnnouncements,
  initialExamResults,
} from '../data/mockData';

import { adminService } from '../api/adminService';

export const Dashboard: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const [liveMetrics, setLiveMetrics] = React.useState<any>(null);

  React.useEffect(() => {
    let isMounted = true;
    adminService
      .getDashboardStats()
      .then((data) => {
        if (isMounted && data?.metrics) {
          setLiveMetrics(data.metrics);
        }
      })
      .catch((err) => {
        console.warn('Live dashboard stats not loaded, using fallback data:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalStudents = liveMetrics?.total_students ?? initialStudents.length;
  const totalTeachers = liveMetrics?.total_teachers ?? initialTeachers.length;
  const totalClasses = liveMetrics?.total_classes ?? initialClasses.length;
  const totalCollected = liveMetrics?.total_fee_collected ?? initialFeePayments
    .filter((f) => f.status === 'paid' || f.status === 'partial')
    .reduce((acc, curr) => acc + curr.amount_paid, 0);

  // Admin View
  if (currentRole === 'admin') {
    return (
      <div id="admin-dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Executive School Overview</h1>
            <p className="page-subtitle">
              Welcome back, {currentUser.name}. Here is the real-time operational status for Academic Year 2025–2026.
            </p>
          </div>
          <div className="page-actions">
            <Link to="/students" className="btn btn-primary" id="btn-quick-add-student">
              <Users size={16} /> Add Student
            </Link>
            <Link to="/fees" className="btn btn-secondary" id="btn-quick-collect-fee">
              <DollarSign size={16} /> Collect Fees
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Enrolled</span>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                <Users size={22} />
              </div>
            </div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-trend trend-up">
              <TrendingUp size={14} /> +12% from previous term
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Faculty Staff</span>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <GraduationCap size={22} />
              </div>
            </div>
            <div className="stat-value">{totalTeachers}</div>
            <div className="stat-trend trend-up">
              <TrendingUp size={14} /> 100% active assignments
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Active Classes</span>
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <BookOpen size={22} />
              </div>
            </div>
            <div className="stat-value">{totalClasses}</div>
            <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
              6 active sections
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Fees Collected</span>
              <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <DollarSign size={22} />
              </div>
            </div>
            <div className="stat-value">${totalCollected.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <TrendingUp size={14} /> 85.4% collection target
            </div>
          </div>
        </div>

        {/* Dual Panel Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Recent School Circulars */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <AlertCircle size={18} style={{ color: 'var(--primary)' }} /> Recent Notices & Circulars
              </h2>
              <Link to="/announcements" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {initialAnnouncements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass-strong)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ann.title}</span>
                    <span
                      className={`badge ${
                        ann.priority === 'urgent' ? 'badge-suspended' : ann.priority === 'important' ? 'badge-pending' : 'badge-info'
                      }`}
                    >
                      {ann.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.4rem 0' }}>
                    {ann.content.substring(0, 95)}...
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                    Posted: {ann.published_at} • Audience: {ann.target_audience}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Operational Highlights */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Today's Operations
              </h2>
              <span className="badge badge-active">All Systems Nominal</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Grade 10 Section A Attendance</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Recorded by Dr. Sarah Jenkins (3 Present, 1 Absent)
                  </div>
                </div>
                <Link to="/attendance" className="btn btn-secondary btn-sm">
                  Review
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Midterm Examination Approaching</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Starts October 25, 2026 • 24 Students eligible
                  </div>
                </div>
                <Link to="/examinations" className="btn btn-secondary btn-sm">
                  Schedules
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Stripe / Bank Reconciliation</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Latest receipt RCP-2026-0081 verified
                  </div>
                </div>
                <Link to="/fees" className="btn btn-secondary btn-sm">
                  Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher View
  if (currentRole === 'teacher') {
    return (
      <div id="teacher-dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Faculty Portal</h1>
            <p className="page-subtitle">Welcome back, {currentUser.name}. Here is your teaching schedule and class overview.</p>
          </div>
          <div className="page-actions">
            <Link to="/attendance" className="btn btn-primary" id="btn-teacher-mark-attendance">
              <CheckCircle2 size={16} /> Mark Today's Attendance
            </Link>
            <Link to="/examinations" className="btn btn-secondary">
              <Award size={16} /> Enter Marks
            </Link>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Classes Assigned</span>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                <BookOpen size={22} />
              </div>
            </div>
            <div className="stat-value">2</div>
            <div className="stat-trend">Grade 10-A, Grade 9-A</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Taught Students</span>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Users size={22} />
              </div>
            </div>
            <div className="stat-value">4</div>
            <div className="stat-trend trend-up">94% average attendance</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Next Period Today</span>
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Clock size={22} />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>08:30 AM</div>
            <div className="stat-trend" style={{ color: 'var(--primary)' }}>Advanced Math • Lab 301</div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Calendar size={18} style={{ color: 'var(--primary)' }} /> Today's Scheduled Lectures (Monday)
            </h2>
            <Link to="/timetable" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
              Full Weekly Timetable →
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Time Slot</th>
                  <th>Subject</th>
                  <th>Class & Section</th>
                  <th>Room</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Period 1</strong></td>
                  <td>08:30 - 09:20</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>Advanced Mathematics</td>
                  <td>Grade 10 - Section A</td>
                  <td><span className="badge badge-info">Lab 301</span></td>
                  <td>
                    <Link to="/attendance" className="btn btn-secondary btn-sm">Take Attendance</Link>
                  </td>
                </tr>
                <tr>
                  <td><strong>Period 4</strong></td>
                  <td>11:30 - 12:20</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>Physics & Lab</td>
                  <td>Grade 10 - Section A</td>
                  <td><span className="badge badge-info">Physics Lab</span></td>
                  <td>
                    <span className="badge badge-pending">Upcoming</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Student View
  if (currentRole === 'student') {
    const student = initialStudents.find((s) => s.id === currentUser.student_profile?.id) || initialStudents[0];
    const rollNo = currentUser.student_profile?.roll_number || student.roll_number || 'R-01';
    const classLabel = currentUser.student_profile?.school_class?.name || 'Grade 10';
    const sectionLabel = currentUser.student_profile?.section?.name || 'A';
    const results = initialExamResults.filter((r) => r.student_profile_id === (currentUser.student_profile?.id ?? student.id));

    return (
      <div id="student-dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Student Portal</h1>
            <p className="page-subtitle">Welcome, {currentUser.name}! Roll: {rollNo} • {classLabel} Section {sectionLabel}</p>
          </div>
          <div className="page-actions">
            <Link to="/timetable" className="btn btn-secondary">
              <Calendar size={16} /> My Timetable
            </Link>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Cumulative GPA</span>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                <Award size={22} />
              </div>
            </div>
            <div className="stat-value">3.95</div>
            <div className="stat-trend trend-up">Grade Honors Standing</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Attendance Rate</span>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div className="stat-value">98.5%</div>
            <div className="stat-trend trend-up">Present 39 of 40 Days</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Tuition Status</span>
              <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <DollarSign size={22} />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>Fully Paid</div>
            <div className="stat-trend trend-up">No outstanding balance</div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Award size={18} style={{ color: 'var(--primary)' }} /> Latest Midterm Examination Scores
            </h2>
            <Link to="/examinations" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
              View Report Card →
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Grade</th>
                  <th>Teacher Remarks</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.id}>
                    <td style={{ fontWeight: 600 }}>
                      {res.subject_id === 1 ? 'Advanced Mathematics' : res.subject_id === 4 ? 'Computer Science' : 'English Literature'}
                    </td>
                    <td><strong style={{ color: 'var(--text-main)' }}>{res.marks_obtained}</strong></td>
                    <td>{res.total_marks}</td>
                    <td><span className="badge badge-active">{res.grade}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{res.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Parent View
  return (
    <div id="parent-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guardian & Parent Portal</h1>
          <p className="page-subtitle">Welcome, {currentUser.name}. Monitoring academic compliance and progress for your enrolled ward.</p>
        </div>
        <div className="page-actions">
          <Link to="/messages" className="btn btn-secondary">
            Message Teacher
          </Link>
          <Link to="/fees" className="btn btn-primary">
            <DollarSign size={16} /> Fee Vouchers
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Child Attendance</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-value">98.5%</div>
          <div className="stat-trend trend-up">Excellent daily attendance</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Latest Exam Average</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <Award size={22} />
            </div>
          </div>
          <div className="stat-value">93.3%</div>
          <div className="stat-trend trend-up">Top 5 percentile in Grade 10</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Fee Clearance</span>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.4rem' }}>
            $0.00 Due
          </div>
          <div className="stat-trend trend-up">Term 1 invoices settled</div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <FileText size={18} style={{ color: 'var(--primary)' }} /> Recent Fee Payments & Printable Receipts
          </h2>
          <Link to="/fees" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
            View All Receipts →
          </Link>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Fee Type</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>RCP-2026-0081</strong></td>
                <td>Annual Tuition Fee</td>
                <td>$2,400.00</td>
                <td>2026-10-05</td>
                <td>Online (Stripe)</td>
                <td><span className="badge badge-paid">Paid</span></td>
              </tr>
              <tr>
                <td><strong>RCP-2026-0082</strong></td>
                <td>STEM & Robotics Lab Fee</td>
                <td>$350.00</td>
                <td>2026-10-05</td>
                <td>Card</td>
                <td><span className="badge badge-paid">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
