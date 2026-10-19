<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\ExamServiceInterface;
use App\Http\Requests\Exam\StoreExamResultRequest;
use App\Http\Resources\ExamResultResource;
use App\Models\ExamResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamResultController extends ApiController
{
    protected ExamServiceInterface $examService;

    public function __construct(ExamServiceInterface $examService)
    {
        $this->examService = $examService;
    }

    /**
     * Display a listing of exam results.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ExamResult::with(['exam', 'student.user', 'subject']);

        if ($request->filled('exam_id')) {
            $query->where('exam_id', $request->query('exam_id'));
        }

        if ($request->filled('student_id')) {
            $query->where('student_profile_id', $request->query('student_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->query('subject_id'));
        }

        return $this->successResponse(
            ExamResultResource::collection($query->get()),
            'Exam results retrieved.'
        );
    }

    /**
     * Batch submit or update student exam marks.
     */
    public function store(StoreExamResultRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $examId = (int) $validated['exam_id'];

        $saved = $this->examService->recordResults($examId, $validated);

        $this->logActivity("Entered examination scores for subject {$validated['subject_id']}", 'Examinations');

        return $this->successResponse(
            count($saved) . ' evaluation scores saved.',
            'Exam results saved successfully.',
            201
        );
    }

    /**
     * Generate an official academic transcript / report card for a student.
     */
    public function studentReportCard(int $studentId, Request $request): JsonResponse
    {
        $user = $request->user();

        // IDOR Authorization: Students can only view their own transcript; Parents only their child's
        if ($user->role === 'student') {
            if (!$user->studentProfile || $user->studentProfile->id !== $studentId) {
                return $this->errorResponse('Access denied. You can only view your own transcript.', null, 403);
            }
        } elseif ($user->role === 'parent') {
            $isChild = \App\Models\StudentProfile::where('id', $studentId)
                ->where('parent_id', $user->parentProfile?->id)
                ->exists();
            if (!$isChild) {
                return $this->errorResponse('Access denied. You can only view your registered child transcript.', null, 403);
            }
        }

        $examId = $request->filled('exam_id') ? (int) $request->query('exam_id') : null;

        $reportCard = $this->examService->getStudentReportCard($studentId, $examId);

        return $this->successResponse($reportCard, 'Student report card generated.');
    }
}
