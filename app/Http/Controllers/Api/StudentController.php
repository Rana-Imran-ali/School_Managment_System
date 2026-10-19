<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\StudentServiceInterface;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends ApiController
{
    protected StudentServiceInterface $studentService;

    public function __construct(StudentServiceInterface $studentService)
    {
        $this->studentService = $studentService;
    }

    /**
     * Display a listing of students with optional search and class filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'class_id', 'section_id']);
        $perPage = (int) $request->query('per_page', 15);

        $students = $this->studentService->getStudents($filters, $perPage);

        return $this->successResponse([
            'items' => StudentResource::collection($students),
            'pagination' => [
                'total'        => $students->total(),
                'per_page'     => $students->perPage(),
                'current_page' => $students->currentPage(),
                'last_page'    => $students->lastPage(),
            ],
        ], 'Students retrieved successfully.');
    }

    /**
     * Store a newly created student (User + StudentProfile) in a transaction.
     */
    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = $this->studentService->createStudent($request->validated());

        $this->logActivity("Enrolled new student {$student->user->name} ({$student->admission_number})", 'Students');

        return $this->successResponse(new StudentResource($student), 'Student admitted and enrolled successfully.', 201);
    }

    /**
     * Display the specified student dossier.
     */
    public function show(int $id): JsonResponse
    {
        $student = $this->studentService->findStudent($id);

        if (!$student) {
            return $this->notFoundResponse('Student record not found.');
        }

        return $this->successResponse(new StudentResource($student), 'Student details retrieved.');
    }

    /**
     * Update the specified student profile.
     */
    public function update(UpdateStudentRequest $request, int $id): JsonResponse
    {
        $student = $this->studentService->findStudent($id);

        if (!$student) {
            return $this->notFoundResponse('Student record not found.');
        }

        $updated = $this->studentService->updateStudent($student, $request->validated());

        $this->logActivity("Updated student record for {$updated->user->name}", 'Students');

        return $this->successResponse(new StudentResource($updated), 'Student profile updated successfully.');
    }

    /**
     * Remove the specified student.
     */
    public function destroy(int $id): JsonResponse
    {
        $student = $this->studentService->findStudent($id);

        if (!$student) {
            return $this->notFoundResponse('Student record not found.');
        }

        $name = $student->user?->name ?? 'Student';
        $this->studentService->deleteStudent($student);

        $this->logActivity("Removed student {$name}", 'Students');

        return $this->successResponse(null, "Student {$name} removed successfully.");
    }
}
