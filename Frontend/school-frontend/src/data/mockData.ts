import type {
  User,
  AcademicYear,
  SchoolClass,
  Section,
  Subject,
  Period,
  ParentProfile,
  TeacherProfile,
  StudentProfile,
  TeacherAssignment,
  TimetableSlot,
  AttendanceRecord,
  Grade,
  Exam,
  ExamResult,
  FeeType,
  FeeStructure,
  FeePayment,
  Announcement,
  Message,
  ActivityLog,
} from '../types';

export const initialAcademicYears: AcademicYear[] = [
  { id: 1, name: '2025-2026', start_date: '2025-08-15', end_date: '2026-06-15', is_current: true },
  { id: 2, name: '2024-2025', start_date: '2024-08-15', end_date: '2025-06-15', is_current: false },
];

export const initialClasses: SchoolClass[] = [
  { id: 1, name: 'Grade 9', numeric_value: 9, description: 'Freshman High School' },
  { id: 2, name: 'Grade 10', numeric_value: 10, description: 'Sophomore High School' },
  { id: 3, name: 'Grade 11', numeric_value: 11, description: 'Junior High School' },
  { id: 4, name: 'Grade 12', numeric_value: 12, description: 'Senior High School' },
];

export const initialSections: Section[] = [
  { id: 1, school_class_id: 1, name: 'A', capacity: 35 },
  { id: 2, school_class_id: 1, name: 'B', capacity: 35 },
  { id: 3, school_class_id: 2, name: 'A', capacity: 32 },
  { id: 4, school_class_id: 2, name: 'B', capacity: 32 },
  { id: 5, school_class_id: 3, name: 'A', capacity: 30 },
  { id: 6, school_class_id: 4, name: 'A', capacity: 28 },
];

export const initialSubjects: Subject[] = [
  { id: 1, name: 'Advanced Mathematics', code: 'MATH-101', type: 'core', description: 'Calculus, Algebra & Trigonometry' },
  { id: 2, name: 'Physics & Lab', code: 'PHYS-201', type: 'core', description: 'Mechanics, Optics & Thermodynamics' },
  { id: 3, name: 'English Literature', code: 'ENG-102', type: 'core', description: 'World Literature and Composition' },
  { id: 4, name: 'Computer Science', code: 'CS-301', type: 'elective', description: 'Algorithms & Fullstack Development' },
  { id: 5, name: 'Chemistry', code: 'CHEM-202', type: 'core', description: 'Organic & Inorganic Chemistry' },
  { id: 6, name: 'World History', code: 'HIST-105', type: 'elective', description: 'Modern Global Civilizations' },
];

export const initialPeriods: Period[] = [
  { id: 1, name: 'Period 1', start_time: '08:30', end_time: '09:20', is_break: false },
  { id: 2, name: 'Period 2', start_time: '09:25', end_time: '10:15', is_break: false },
  { id: 3, name: 'Morning Break', start_time: '10:15', end_time: '10:35', is_break: true },
  { id: 4, name: 'Period 3', start_time: '10:35', end_time: '11:25', is_break: false },
  { id: 5, name: 'Period 4', start_time: '11:30', end_time: '12:20', is_break: false },
  { id: 6, name: 'Lunch Recess', start_time: '12:20', end_time: '13:05', is_break: true },
  { id: 7, name: 'Period 5', start_time: '13:05', end_time: '13:55', is_break: false },
  { id: 8, name: 'Period 6', start_time: '14:00', end_time: '14:50', is_break: false },
];

export const initialUsers: User[] = [
  {
    id: 1,
    name: 'Alexander Wright',
    email: 'admin@educore.edu',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    gender: 'male',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: '450 Innovation Blvd, Silicon Valley, CA',
  },
  {
    id: 2,
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@educore.edu',
    role: 'teacher',
    phone: '+1 (555) 349-2041',
    gender: 'female',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    address: '88 Meadow Court, Berkeley, CA',
  },
  {
    id: 3,
    name: 'Prof. Marcus Vance',
    email: 'marcus.vance@educore.edu',
    role: 'teacher',
    phone: '+1 (555) 890-1122',
    gender: 'male',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    address: '14 Elm Street, Oakland, CA',
  },
  {
    id: 4,
    name: 'David Reynolds',
    email: 'david.reynolds@gmail.com',
    role: 'parent',
    phone: '+1 (555) 441-9081',
    gender: 'male',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: '320 Highland Park Way, San Francisco, CA',
  },
  {
    id: 5,
    name: 'Liam Reynolds',
    email: 'liam.reynolds@student.educore.edu',
    role: 'student',
    phone: '+1 (555) 441-9082',
    gender: 'male',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    address: '320 Highland Park Way, San Francisco, CA',
    date_of_birth: '2009-04-12',
  },
  {
    id: 6,
    name: 'Sophia Patel',
    email: 'sophia.patel@student.educore.edu',
    role: 'student',
    phone: '+1 (555) 772-9901',
    gender: 'female',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    address: '912 Sunset Terrace, San Jose, CA',
    date_of_birth: '2009-09-20',
  },
  {
    id: 7,
    name: 'Ethan Chen',
    email: 'ethan.chen@student.educore.edu',
    role: 'student',
    phone: '+1 (555) 302-8812',
    gender: 'male',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    address: '104 Cypress Ave, Palo Alto, CA',
    date_of_birth: '2008-11-05',
  },
  {
    id: 8,
    name: 'Emma Watson',
    email: 'emma.watson@student.educore.edu',
    role: 'student',
    phone: '+1 (555) 601-3329',
    gender: 'female',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    address: '22 Ocean Ave, Pacifica, CA',
    date_of_birth: '2009-02-18',
  },
];

export const initialParents: ParentProfile[] = [
  {
    id: 1,
    user_id: 4,
    occupation: 'Lead Solutions Architect',
    relationship: 'Father',
    user: initialUsers.find((u) => u.id === 4),
  },
];

export const initialTeachers: TeacherProfile[] = [
  {
    id: 1,
    user_id: 2,
    employee_id: 'EMP-T-1001',
    qualification: 'Ph.D. in Applied Mathematics',
    specialization: 'Advanced Calculus & Discrete Math',
    joining_date: '2020-08-01',
    salary: 82000,
    bio: 'Over 12 years of experience teaching STEM curricula with a focus on competitive mathematics.',
    user: initialUsers.find((u) => u.id === 2),
  },
  {
    id: 2,
    user_id: 3,
    employee_id: 'EMP-T-1002',
    qualification: 'M.S. in Computer Science',
    specialization: 'Software Engineering & AI',
    joining_date: '2021-09-15',
    salary: 85000,
    bio: 'Former tech lead passionate about teaching computational thinking and fullstack architecture to youth.',
    user: initialUsers.find((u) => u.id === 3),
  },
];

export const initialStudents: StudentProfile[] = [
  {
    id: 1,
    user_id: 5,
    parent_id: 1,
    current_class_id: 2,
    current_section_id: 3,
    admission_number: 'ADM-2024-001',
    roll_number: '10-A-01',
    admission_date: '2024-08-10',
    blood_group: 'O+',
    religion: 'Christianity',
    user: initialUsers.find((u) => u.id === 5),
    parent: initialParents[0],
    school_class: initialClasses[1],
    section: initialSections[2],
  },
  {
    id: 2,
    user_id: 6,
    parent_id: 1,
    current_class_id: 2,
    current_section_id: 3,
    admission_number: 'ADM-2024-002',
    roll_number: '10-A-02',
    admission_date: '2024-08-11',
    blood_group: 'B+',
    religion: 'Hinduism',
    user: initialUsers.find((u) => u.id === 6),
    school_class: initialClasses[1],
    section: initialSections[2],
  },
  {
    id: 3,
    user_id: 7,
    current_class_id: 2,
    current_section_id: 3,
    admission_number: 'ADM-2024-003',
    roll_number: '10-A-03',
    admission_date: '2024-08-12',
    blood_group: 'A+',
    religion: 'None',
    user: initialUsers.find((u) => u.id === 7),
    school_class: initialClasses[1],
    section: initialSections[2],
  },
  {
    id: 4,
    user_id: 8,
    current_class_id: 2,
    current_section_id: 3,
    admission_number: 'ADM-2024-004',
    roll_number: '10-A-04',
    admission_date: '2024-08-14',
    blood_group: 'AB-',
    religion: 'Christianity',
    user: initialUsers.find((u) => u.id === 8),
    school_class: initialClasses[1],
    section: initialSections[2],
  },
];

export const initialTeacherAssignments: TeacherAssignment[] = [
  { id: 1, teacher_profile_id: 1, school_class_id: 2, section_id: 3, subject_id: 1, academic_year_id: 1 },
  { id: 2, teacher_profile_id: 2, school_class_id: 2, section_id: 3, subject_id: 4, academic_year_id: 1 },
  { id: 3, teacher_profile_id: 1, school_class_id: 1, section_id: 1, subject_id: 1, academic_year_id: 1 },
];

export const initialTimetable: TimetableSlot[] = [
  { id: 1, school_class_id: 2, section_id: 3, subject_id: 1, teacher_profile_id: 1, period_id: 1, day_of_week: 'monday', room_number: 'Lab 301' },
  { id: 2, school_class_id: 2, section_id: 3, subject_id: 4, teacher_profile_id: 2, period_id: 2, day_of_week: 'monday', room_number: 'CS Lab 2' },
  { id: 3, school_class_id: 2, section_id: 3, subject_id: 2, teacher_profile_id: 1, period_id: 4, day_of_week: 'monday', room_number: 'Physics Lab' },
  { id: 4, school_class_id: 2, section_id: 3, subject_id: 3, teacher_profile_id: 2, period_id: 5, day_of_week: 'monday', room_number: 'Room 204' },
  { id: 5, school_class_id: 2, section_id: 3, subject_id: 4, teacher_profile_id: 2, period_id: 1, day_of_week: 'tuesday', room_number: 'CS Lab 2' },
  { id: 6, school_class_id: 2, section_id: 3, subject_id: 1, teacher_profile_id: 1, period_id: 2, day_of_week: 'tuesday', room_number: 'Lab 301' },
  { id: 7, school_class_id: 2, section_id: 3, subject_id: 5, teacher_profile_id: 1, period_id: 4, day_of_week: 'wednesday', room_number: 'Chem Lab' },
  { id: 8, school_class_id: 2, section_id: 3, subject_id: 1, teacher_profile_id: 1, period_id: 1, day_of_week: 'thursday', room_number: 'Lab 301' },
  { id: 9, school_class_id: 2, section_id: 3, subject_id: 4, teacher_profile_id: 2, period_id: 2, day_of_week: 'friday', room_number: 'CS Lab 2' },
];

export const initialAttendances: AttendanceRecord[] = [
  { id: 1, student_profile_id: 1, school_class_id: 2, section_id: 3, date: '2026-10-19', status: 'present' },
  { id: 2, student_profile_id: 2, school_class_id: 2, section_id: 3, date: '2026-10-19', status: 'present' },
  { id: 3, student_profile_id: 3, school_class_id: 2, section_id: 3, date: '2026-10-19', status: 'late', remarks: 'Bus breakdown' },
  { id: 4, student_profile_id: 4, school_class_id: 2, section_id: 3, date: '2026-10-19', status: 'absent', remarks: 'Medical leave' },
  { id: 5, student_profile_id: 1, school_class_id: 2, section_id: 3, date: '2026-10-18', status: 'present' },
  { id: 6, student_profile_id: 2, school_class_id: 2, section_id: 3, date: '2026-10-18', status: 'present' },
  { id: 7, student_profile_id: 3, school_class_id: 2, section_id: 3, date: '2026-10-18', status: 'present' },
  { id: 8, student_profile_id: 4, school_class_id: 2, section_id: 3, date: '2026-10-18', status: 'present' },
];

export const initialGrades: Grade[] = [
  { id: 1, name: 'A+', min_mark: 95, max_mark: 100, grade_point: 4.0, description: 'Outstanding Academic Performance' },
  { id: 2, name: 'A', min_mark: 85, max_mark: 94, grade_point: 3.8, description: 'Excellent' },
  { id: 3, name: 'B', min_mark: 75, max_mark: 84, grade_point: 3.0, description: 'Good' },
  { id: 4, name: 'C', min_mark: 60, max_mark: 74, grade_point: 2.0, description: 'Satisfactory' },
  { id: 5, name: 'F', min_mark: 0, max_mark: 59, grade_point: 0.0, description: 'Needs Remediation' },
];

export const initialExams: Exam[] = [
  { id: 1, name: 'Midterm Assessment 2026', academic_year_id: 1, start_date: '2026-10-25', end_date: '2026-10-31', term: 'First Semester' },
  { id: 2, name: 'Final Semester Examinations', academic_year_id: 1, start_date: '2026-12-10', end_date: '2026-12-20', term: 'Winter Term' },
];

export const initialExamResults: ExamResult[] = [
  { id: 1, exam_id: 1, student_profile_id: 1, subject_id: 1, marks_obtained: 94, total_marks: 100, grade: 'A', remarks: 'Exceptional analytical proofs' },
  { id: 2, exam_id: 1, student_profile_id: 1, subject_id: 4, marks_obtained: 98, total_marks: 100, grade: 'A+', remarks: 'Perfect code architecture' },
  { id: 3, exam_id: 1, student_profile_id: 1, subject_id: 3, marks_obtained: 88, total_marks: 100, grade: 'A', remarks: 'Well structured essay' },
  { id: 4, exam_id: 1, student_profile_id: 2, subject_id: 1, marks_obtained: 96, total_marks: 100, grade: 'A+', remarks: 'Top score in class' },
  { id: 5, exam_id: 1, student_profile_id: 2, subject_id: 4, marks_obtained: 91, total_marks: 100, grade: 'A', remarks: 'Great problem solving' },
  { id: 6, exam_id: 1, student_profile_id: 3, subject_id: 1, marks_obtained: 78, total_marks: 100, grade: 'B', remarks: 'Good attempt' },
  { id: 7, exam_id: 1, student_profile_id: 4, subject_id: 1, marks_obtained: 82, total_marks: 100, grade: 'B', remarks: 'Steady improvement' },
];

export const initialFeeTypes: FeeType[] = [
  { id: 1, name: 'Annual Tuition Fee', description: 'Core academic instruction and curriculum licensing' },
  { id: 2, name: 'STEM & Robotics Lab Fee', description: 'Practical equipment and materials' },
  { id: 3, name: 'Library & Digital Resources', description: 'Access to academic journals and e-books' },
  { id: 4, name: 'Extracurricular & Athletics', description: 'Sports facilities and tournament entry' },
];

export const initialFeeStructures: FeeStructure[] = [
  { id: 1, fee_type_id: 1, school_class_id: 2, academic_year_id: 1, amount: 2400.0, due_date: '2026-11-01' },
  { id: 2, fee_type_id: 2, school_class_id: 2, academic_year_id: 1, amount: 350.0, due_date: '2026-11-01' },
  { id: 3, fee_type_id: 3, school_class_id: 2, academic_year_id: 1, amount: 150.0, due_date: '2026-11-01' },
];

export const initialFeePayments: FeePayment[] = [
  {
    id: 1,
    student_profile_id: 1,
    fee_structure_id: 1,
    fee_type_id: 1,
    amount_paid: 2400.0,
    payment_date: '2026-10-05',
    payment_method: 'online',
    transaction_id: 'TXN-9023184',
    status: 'paid',
    receipt_number: 'RCP-2026-0081',
    remarks: 'Full annual tuition cleared via Stripe Gateway',
    recorded_by: 1,
  },
  {
    id: 2,
    student_profile_id: 1,
    fee_structure_id: 2,
    fee_type_id: 2,
    amount_paid: 350.0,
    payment_date: '2026-10-05',
    payment_method: 'card',
    transaction_id: 'POS-4402',
    status: 'paid',
    receipt_number: 'RCP-2026-0082',
    remarks: 'Robotics lab clearance',
    recorded_by: 1,
  },
  {
    id: 3,
    student_profile_id: 2,
    fee_structure_id: 1,
    fee_type_id: 1,
    amount_paid: 1200.0,
    payment_date: '2026-10-12',
    payment_method: 'bank_transfer',
    transaction_id: 'WIRE-89102',
    status: 'partial',
    receipt_number: 'RCP-2026-0094',
    remarks: 'Installment 1 of 2 received',
    recorded_by: 1,
  },
  {
    id: 4,
    student_profile_id: 3,
    fee_structure_id: 1,
    fee_type_id: 1,
    amount_paid: 0.0,
    payment_date: '2026-10-15',
    payment_method: 'cash',
    status: 'pending',
    receipt_number: 'INV-2026-0105',
    remarks: 'Invoice dispatched to guardian',
    recorded_by: 1,
  },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Upcoming STEM & Innovation Fair 2026',
    content: 'All high school classes are invited to showcase innovative engineering and software projects in the main auditorium. Project proposal submissions close on October 28.',
    target_audience: 'all',
    published_at: '2026-10-17 09:30',
    author_name: 'Principal Office',
    priority: 'urgent',
  },
  {
    id: 2,
    title: 'Midterm Examination Schedule Released',
    content: 'The official datesheet for the upcoming semester examinations has been published. Please review your respective timetable and ensure all admit slips are signed.',
    target_audience: 'students',
    published_at: '2026-10-15 14:00',
    author_name: 'Academic Affairs',
    priority: 'important',
  },
  {
    id: 3,
    title: 'Staff Faculty Meeting on Curriculum Standards',
    content: 'Mandatory faculty briefing regarding hybrid grading criteria and Q4 rubric moderation this Thursday at 3:30 PM in Conference Hall B.',
    target_audience: 'teachers',
    published_at: '2026-10-14 11:15',
    author_name: 'Academic Dean',
    priority: 'normal',
  },
  {
    id: 4,
    title: 'Parent-Teacher Conference Registration Open',
    content: 'Parents can now reserve 15-minute consultation slots with class advisors through the parent portal for the upcoming November evaluation cycle.',
    target_audience: 'parents',
    published_at: '2026-10-12 16:45',
    author_name: 'Student Welfare Department',
    priority: 'important',
  },
];

export const initialMessages: Message[] = [
  {
    id: 1,
    sender_id: 2,
    receiver_id: 4,
    subject: 'Liam’s Outstanding Progress in STEM',
    body: 'Hello Mr. Reynolds, I wanted to personally commend Liam on his exceptional scores in Advanced Mathematics and algorithms. He has demonstrated remarkable leadership in lab projects.',
    is_read: true,
    created_at: '2026-10-18 10:14',
  },
  {
    id: 2,
    sender_id: 4,
    receiver_id: 2,
    subject: 'Re: Liam’s Outstanding Progress in STEM',
    body: 'Thank you Dr. Jenkins! We are thrilled to hear that. He spends many evenings tinkering with algorithmic puzzles. Thank you for your guidance.',
    is_read: true,
    created_at: '2026-10-18 11:30',
  },
  {
    id: 3,
    sender_id: 1,
    receiver_id: 2,
    subject: 'Term 1 Subject Report Review',
    body: 'Please review and finalize the semester grades for Grade 10 Section A by Friday afternoon for report card generation.',
    is_read: false,
    created_at: '2026-10-19 08:45',
  },
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 1,
    user_name: 'Alexander Wright',
    action: 'Generated Fee Receipt RCP-2026-0081',
    ip_address: '192.168.1.45',
    created_at: '2026-10-19 09:12:40',
    details: 'Received $2,400.00 tuition payment for Liam Reynolds',
  },
  {
    id: 2,
    user_name: 'Dr. Sarah Jenkins',
    action: 'Marked Daily Attendance',
    ip_address: '192.168.1.102',
    created_at: '2026-10-19 08:35:12',
    details: 'Submitted attendance for Grade 10 Section A (4 students recorded)',
  },
  {
    id: 3,
    user_name: 'Prof. Marcus Vance',
    action: 'Updated Midterm Exam Results',
    ip_address: '192.168.1.114',
    created_at: '2026-10-18 16:20:00',
    details: 'Uploaded grades for CS-301 Computer Science',
  },
  {
    id: 4,
    user_name: 'Alexander Wright',
    action: 'Published Announcement',
    ip_address: '192.168.1.45',
    created_at: '2026-10-17 09:30:15',
    details: 'STEM & Innovation Fair circular dispatched to all users',
  },
];

// Helper to initialize local storage state with fallback
export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`educore_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`educore_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}
