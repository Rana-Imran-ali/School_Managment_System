<?php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ExamResultController;
use App\Http\Controllers\Api\FeePaymentController;
use App\Http\Controllers\Api\FeeStructureController;
use App\Http\Controllers\Api\FeeTypeController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ParentProfileController;
use App\Http\Controllers\Api\PeriodController;
use App\Http\Controllers\Api\SchoolClassController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TeacherAssignmentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TimetableController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

/*
|--------------------------------------------------------------------------
| Protected Endpoints (Requires Sanctum Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Current user sessions
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // General Read Routes (Accessible to all authenticated roles)
    Route::get('/academic-years', [AcademicYearController::class, 'index']);
    Route::get('/academic-years/{id}', [AcademicYearController::class, 'show']);
    Route::get('/classes', [SchoolClassController::class, 'index']);
    Route::get('/classes/{id}', [SchoolClassController::class, 'show']);
    Route::get('/sections', [SectionController::class, 'index']);
    Route::get('/sections/{id}', [SectionController::class, 'show']);
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [SubjectController::class, 'show']);
    Route::get('/periods', [PeriodController::class, 'index']);
    Route::get('/periods/{id}', [PeriodController::class, 'show']);
    Route::get('/timetables', [TimetableController::class, 'index']);
    Route::get('/attendances', [AttendanceController::class, 'index']);
    Route::get('/attendances/report', [AttendanceController::class, 'report']);
    Route::get('/grades', [GradeController::class, 'index']);
    Route::get('/grades/{id}', [GradeController::class, 'show']);
    Route::get('/exams', [ExamController::class, 'index']);
    Route::get('/exams/{id}', [ExamController::class, 'show']);
    Route::get('/exam-results', [ExamResultController::class, 'index']);
    Route::get('/students/{id}/report-card', [ExamResultController::class, 'studentReportCard']);
    Route::get('/fee-payments', [FeePaymentController::class, 'index']);
    Route::get('/fee-payments/{id}', [FeePaymentController::class, 'show']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);

    // Direct Messaging (Available to all authenticated users)
    Route::get('/messages/inbox', [MessageController::class, 'inbox']);
    Route::get('/messages/sent', [MessageController::class, 'sent']);
    Route::get('/messages/conversation/{contactId}', [MessageController::class, 'conversation']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Staff Level (Administrator & Teacher)
    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{id}', [StudentController::class, 'show']);
        Route::get('/teachers', [TeacherController::class, 'index']);
        Route::get('/teachers/{id}', [TeacherController::class, 'show']);
        Route::post('/attendances', [AttendanceController::class, 'store']);
        Route::post('/exam-results', [ExamResultController::class, 'store']);
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    });

    // Administrator Only Operations
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard-stats', [AdminController::class, 'stats']);

        // Academic Configuration
        Route::post('/academic-years', [AcademicYearController::class, 'store']);
        Route::put('/academic-years/{id}', [AcademicYearController::class, 'update']);
        Route::delete('/academic-years/{id}', [AcademicYearController::class, 'destroy']);
        Route::post('/academic-years/{id}/set-current', [AcademicYearController::class, 'setCurrent']);

        Route::post('/classes', [SchoolClassController::class, 'store']);
        Route::put('/classes/{id}', [SchoolClassController::class, 'update']);
        Route::delete('/classes/{id}', [SchoolClassController::class, 'destroy']);

        Route::post('/sections', [SectionController::class, 'store']);
        Route::put('/sections/{id}', [SectionController::class, 'update']);
        Route::delete('/sections/{id}', [SectionController::class, 'destroy']);

        Route::post('/subjects', [SubjectController::class, 'store']);
        Route::put('/subjects/{id}', [SubjectController::class, 'update']);
        Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);

        Route::post('/periods', [PeriodController::class, 'store']);
        Route::put('/periods/{id}', [PeriodController::class, 'update']);
        Route::delete('/periods/{id}', [PeriodController::class, 'destroy']);

        Route::get('/teacher-assignments', [TeacherAssignmentController::class, 'index']);
        Route::post('/teacher-assignments', [TeacherAssignmentController::class, 'store']);
        Route::delete('/teacher-assignments/{id}', [TeacherAssignmentController::class, 'destroy']);

        // Staff & Student Enrollment CRUD
        Route::post('/students', [StudentController::class, 'store']);
        Route::put('/students/{id}', [StudentController::class, 'update']);
        Route::delete('/students/{id}', [StudentController::class, 'destroy']);

        Route::post('/teachers', [TeacherController::class, 'store']);
        Route::put('/teachers/{id}', [TeacherController::class, 'update']);
        Route::delete('/teachers/{id}', [TeacherController::class, 'destroy']);

        Route::apiResource('parents', ParentProfileController::class);
        Route::get('/parents/{id}/children', [ParentProfileController::class, 'children']);

        // Timetable Scheduling CRUD
        Route::post('/timetables', [TimetableController::class, 'store']);
        Route::delete('/timetables/{id}', [TimetableController::class, 'destroy']);

        // Grading Scale & Exam Setup CRUD
        Route::post('/grades', [GradeController::class, 'store']);
        Route::put('/grades/{id}', [GradeController::class, 'update']);
        Route::delete('/grades/{id}', [GradeController::class, 'destroy']);

        Route::post('/exams', [ExamController::class, 'store']);
        Route::put('/exams/{id}', [ExamController::class, 'update']);
        Route::delete('/exams/{id}', [ExamController::class, 'destroy']);

        // Finance Configuration & Payment Recording
        Route::apiResource('fee-types', FeeTypeController::class)->only(['index', 'store', 'destroy']);
        Route::apiResource('fee-structures', FeeStructureController::class)->only(['index', 'store', 'destroy']);
        Route::post('/fee-payments', [FeePaymentController::class, 'store']);

        // System Audits
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });
});
