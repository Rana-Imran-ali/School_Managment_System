<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\AttendanceServiceInterface;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends ApiController
{
    protected AttendanceServiceInterface $attendanceService;

    public function __construct(AttendanceServiceInterface $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Retrieve attendance records for a specific date and class/section.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date'       => 'nullable|date',
            'class_id'   => 'nullable|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $date = $request->query('date', date('Y-m-d'));
        $filters = [
            'date'       => $date,
            'class_id'   => $request->query('class_id'),
            'section_id' => $request->query('section_id'),
        ];

        $records = $this->attendanceService->getAttendance($filters);

        return $this->successResponse(
            AttendanceResource::collection($records),
            "Attendance records for {$date} retrieved."
        );
    }

    /**
     * Record or batch-update attendance records.
     */
    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $saved = $this->attendanceService->recordAttendance(
            $validated['records'],
            $validated['date'],
            (int) $validated['school_class_id'],
            isset($validated['section_id']) ? (int) $validated['section_id'] : null,
            $request->user()->id
        );

        $this->logActivity("Committed attendance for class {$validated['school_class_id']} on {$validated['date']}", 'Attendance');

        return $this->successResponse(
            count($saved) . ' student attendance records saved.',
            'Attendance register committed successfully.',
            201
        );
    }

    /**
     * Generate an attendance analytic report for a student or section.
     */
    public function report(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'nullable|exists:student_profiles,id',
            'class_id'   => 'nullable|exists:school_classes,id',
            'month'      => 'nullable|string',
        ]);

        if ($request->filled('student_id')) {
            $requestedId = (int) $request->query('student_id');
            $user = $request->user();

            // SEC-03: IDOR guard — scope to ownership
            if ($user->role === 'student') {
                $ownId = $user->studentProfile?->id ?? 0;
                if ($requestedId !== $ownId) {
                    return $this->errorResponse('Access denied. You can only view your own attendance report.', null, 403);
                }
            } elseif ($user->role === 'parent') {
                $childIds = \App\Models\StudentProfile::where('parent_id', $user->parentProfile?->id ?? 0)
                    ->pluck('id');
                if (!$childIds->contains($requestedId)) {
                    return $this->errorResponse('Access denied. You can only view your registered child\'s attendance report.', null, 403);
                }
            }
            // admin/teacher: unrestricted

            $summary = $this->attendanceService->getStudentSummary($requestedId);
            return $this->successResponse($summary, 'Attendance analytics report generated.');
        }

        // Generic class/section report
        $filters = $request->only(['class_id', 'section_id', 'month']);
        $query = \App\Models\Attendance::query();

        if (!empty($filters['class_id'])) {
            $query->where('school_class_id', $filters['class_id']);
        }
        if (!empty($filters['month'])) {
            $query->where('date', 'like', "{$filters['month']}%");
        }

        $total   = (clone $query)->count();
        $present = (clone $query)->where('status', 'present')->count();
        $absent  = (clone $query)->where('status', 'absent')->count();
        $late    = (clone $query)->where('status', 'late')->count();
        $excused = (clone $query)->where('status', 'excused')->count();

        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 100.0;

        return $this->successResponse([
            'total_recorded_days' => $total,
            'present_count'       => $present,
            'absent_count'        => $absent,
            'late_count'          => $late,
            'excused_count'       => $excused,
            'attendance_rate'     => $rate,
        ], 'Attendance analytics report generated.');
    }
}
