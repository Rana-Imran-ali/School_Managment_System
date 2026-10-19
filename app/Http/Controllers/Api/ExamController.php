<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\ExamServiceInterface;
use App\Http\Requests\Exam\StoreExamRequest;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends ApiController
{
    protected ExamServiceInterface $examService;

    public function __construct(ExamServiceInterface $examService)
    {
        $this->examService = $examService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['academic_year_id']);
        $exams = $this->examService->getExams($filters);

        return $this->successResponse(ExamResource::collection($exams), 'Exams retrieved.');
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $exam = $this->examService->createExam($request->validated());
        $this->logActivity("Scheduled examination event {$exam->name}", 'Examinations');

        return $this->successResponse(new ExamResource($exam), 'Examination scheduled successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $exam = Exam::with(['academicYear', 'examResults.student.user', 'examResults.subject'])->find($id);

        if (!$exam) {
            return $this->notFoundResponse('Exam not found.');
        }

        return $this->successResponse(new ExamResource($exam), 'Exam details retrieved.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $exam = Exam::find($id);

        if (!$exam) {
            return $this->notFoundResponse('Exam not found.');
        }

        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'academic_year_id' => 'sometimes|exists:academic_years,id',
            'start_date'       => 'sometimes|date',
            'end_date'         => 'sometimes|date|after_or_equal:start_date',
            'term'             => 'nullable|string|max:100',
        ]);

        $exam->update($validated);
        return $this->successResponse(new ExamResource($exam), 'Exam updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $exam = Exam::find($id);

        if (!$exam) {
            return $this->notFoundResponse('Exam not found.');
        }

        $exam->delete();
        return $this->successResponse(null, 'Exam deleted.');
    }
}
