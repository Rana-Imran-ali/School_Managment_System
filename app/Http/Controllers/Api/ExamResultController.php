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
     * Display a listing of exam results with strict BOLA/IDOR authorization.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ExamResult::with(['exam', 'student.user', 'subject']);

        // IDOR Authorization (SEC-01):
        // Students can only view their own marks.
        // Parents can only view marks for their registered ward children.
        // Teachers & Admins can filter by student_id or view full class marks.
        if ($user->role === 'student') {
            $studentProfileId = $user->studentProfile?->id ?? 0;
            if ($request->filled('student_id') && (int) $request->query('student_id') !== $studentProfileId) {
                return $this->errorResponse('Access denied. You can only view your own examination results.', null, 403);
            }
            $query->where('student_profile_id', $studentProfileId);
        } elseif ($user->role === 'parent') {
            $childIds = \App\Models\StudentProfile::where('parent_id', $user->parentProfile?->id ?? 0)->pluck('id');
            if ($request->filled('student_id')) {
                $requestedId = (int) $request->query('student_id');
                if (!$childIds->contains($requestedId)) {
                    return $this->errorResponse('Access denied. You can only view examination results for your registered child.', null, 403);
                }
                $query->where('student_profile_id', $requestedId);
            } else {
                $query->whereIn('student_profile_id', $childIds);
            }
        } elseif ($request->filled('student_id')) {
            $query->where('student_profile_id', (int) $request->query('student_id'));
        }

        if ($request->filled('exam_id')) {
            $query->where('exam_id', (int) $request->query('exam_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', (int) $request->query('subject_id'));
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
