<?php

namespace App\Http\Controllers\Api;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\FeePayment;
use App\Models\SchoolClass;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends ApiController
{
    /**
     * Retrieve aggregate KPI metrics for administrator dashboard.
     */
    public function stats(): JsonResponse
    {
        $totalStudents = StudentProfile::count();
        $totalTeachers = TeacherProfile::count();
        $totalClasses  = SchoolClass::count();
        $totalUsers    = User::count();

        $totalFeeCollected = FeePayment::whereIn('status', ['paid', 'partial'])->sum('amount_paid');
        $pendingFeeCount    = FeePayment::where('status', 'pending')->count();

        $today = date('Y-m-d');
        $todayAttendancePresent = Attendance::where('date', $today)->where('status', 'present')->count();
        $todayAttendanceTotal   = Attendance::where('date', $today)->count();
        $attendanceRate         = $todayAttendanceTotal > 0
            ? round(($todayAttendancePresent / $todayAttendanceTotal) * 100, 1)
            : 100.0;

        $recentActivities = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(6)
            ->get();

        return $this->successResponse([
            'metrics' => [
                'total_students'      => $totalStudents,
                'total_teachers'      => $totalTeachers,
                'total_classes'       => $totalClasses,
                'total_users'         => $totalUsers,
                'total_fee_collected' => (float) $totalFeeCollected,
                'pending_invoices'    => $pendingFeeCount,
                'today_attendance_rate' => $attendanceRate,
            ],
            'recent_activities' => $recentActivities,
        ], 'Admin metrics retrieved successfully.');
    }
}
