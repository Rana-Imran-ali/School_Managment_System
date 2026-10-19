export type Role = 'admin' | 'teacher' | 'student' | 'parent' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  address?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
}

export interface AcademicYear {
  id: number;
  name: string; // e.g. "2025-2026"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface SchoolClass {
  id: number;
  name: string; // e.g. "Grade 10"
  numeric_value?: number;
  description?: string;
}

export interface Section {
  id: number;
  school_class_id: number;
  name: string; // e.g. "A"
  capacity: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  type: 'core' | 'elective' | 'practical';
  description?: string;
}

export interface Period {
  id: number;
  name: string; // e.g. "Period 1"
  start_time: string; // "08:30"
  end_time: string; // "09:15"
  is_break: boolean;
}

export interface ParentProfile {
  id: number;
  user_id: number;
  occupation?: string;
  relationship?: string; // father, mother, guardian
  user?: User;
}

export interface TeacherProfile {
  id: number;
  user_id: number;
  employee_id: string;
  qualification?: string;
  specialization?: string;
  joining_date?: string;
  salary?: number;
  bio?: string;
  user?: User;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  parent_id?: number;
  current_class_id?: number;
  current_section_id?: number;
  admission_number: string;
  roll_number?: string;
  admission_date?: string;
  blood_group?: string;
  religion?: string;
  user?: User;
  parent?: ParentProfile;
  school_class?: SchoolClass;
  section?: Section;
}

export interface TeacherAssignment {
  id: number;
  teacher_profile_id: number;
  school_class_id: number;
  section_id: number;
  subject_id: number;
  academic_year_id: number;
  teacher?: TeacherProfile;
  school_class?: SchoolClass;
  section?: Section;
  subject?: Subject;
}

export interface TimetableSlot {
  id: number;
  school_class_id: number;
  section_id: number;
  subject_id: number;
  teacher_profile_id: number;
  period_id: number;
  academic_year_id?: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  room_number?: string;
  subject?: Subject;
  teacher?: TeacherProfile;
  period?: Period;
}

export interface AttendanceRecord {
  id: number;
  student_profile_id: number;
  school_class_id: number;
  section_id: number;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  student?: StudentProfile;
}

export interface Grade {
  id: number;
  name: string; // "A+", "A", "B"
  min_mark: number;
  max_mark: number;
  grade_point: number;
  description?: string;
}

export interface Exam {
  id: number;
  name: string; // "Midterm Exam 2026"
  academic_year_id: number;
  start_date: string;
  end_date: string;
  term?: string; // "Term 1", "Term 2"
}

export interface ExamResult {
  id: number;
  exam_id: number;
  student_profile_id: number;
  subject_id: number;
  marks_obtained: number;
  total_marks: number;
  grade?: string;
  remarks?: string;
  student?: StudentProfile;
  subject?: Subject;
  exam?: Exam;
}

export interface FeeType {
  id: number;
  name: string; // "Tuition Fee", "Library Fee"
  description?: string;
}

export interface FeeStructure {
  id: number;
  fee_type_id: number;
  school_class_id: number;
  academic_year_id: number;
  amount: number;
  due_date: string;
  fee_type?: FeeType;
  school_class?: SchoolClass;
}

export interface FeePayment {
  id: number;
  student_profile_id: number;
  fee_structure_id?: number;
  fee_type_id?: number;
  amount_paid: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'online';
  transaction_id?: string;
  status: 'paid' | 'partial' | 'pending';
  receipt_number: string;
  remarks?: string;
  recorded_by?: number;
  student?: StudentProfile;
  fee_type?: FeeType;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target_audience: 'all' | 'teachers' | 'students' | 'parents';
  published_at: string;
  author_id?: number;
  author_name?: string;
  priority?: 'normal' | 'important' | 'urgent';
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  subject?: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  ip_address?: string;
  created_at: string;
  details?: string;
}
