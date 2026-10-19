<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\TeacherServiceInterface;
use App\Http\Requests\Teacher\StoreTeacherRequest;
use App\Http\Requests\Teacher\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends ApiController
{
    protected TeacherServiceInterface $teacherService;

    public function __construct(TeacherServiceInterface $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    /**
     * Display a listing of faculty members.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search']);
        $perPage = (int) $request->query('per_page', 15);

        $teachers = $this->teacherService->getTeachers($filters, $perPage);

        return $this->successResponse([
            'items' => TeacherResource::collection($teachers),
            'pagination' => [
                'total'        => $teachers->total(),
                'per_page'     => $teachers->perPage(),
                'current_page' => $teachers->currentPage(),
                'last_page'    => $teachers->lastPage(),
            ],
        ], 'Faculty directory retrieved successfully.');
    }

    /**
     * Store a newly created teacher profile.
     */
    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $teacher = $this->teacherService->createTeacher($request->validated());

        $this->logActivity("Appointed faculty member {$teacher->user->name} ({$teacher->employee_id})", 'Faculty');

        return $this->successResponse(new TeacherResource($teacher), 'Faculty member appointed successfully.', 201);
    }

    /**
     * Display the specified teacher profile.
     */
    public function show(int $id): JsonResponse
    {
        $teacher = $this->teacherService->findTeacher($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher record not found.');
        }

        return $this->successResponse(new TeacherResource($teacher), 'Teacher details retrieved.');
    }

    /**
     * Update the specified teacher profile.
     */
    public function update(UpdateTeacherRequest $request, int $id): JsonResponse
    {
        $teacher = $this->teacherService->findTeacher($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher record not found.');
        }

        $updated = $this->teacherService->updateTeacher($teacher, $request->validated());

        $this->logActivity("Updated faculty record for {$updated->user->name}", 'Faculty');

        return $this->successResponse(new TeacherResource($updated), 'Teacher profile updated successfully.');
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy(int $id): JsonResponse
    {
        $teacher = $this->teacherService->findTeacher($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher record not found.');
        }

        $name = $teacher->user?->name ?? 'Teacher';
        $this->teacherService->deleteTeacher($teacher);

        $this->logActivity("Removed faculty member {$name}", 'Faculty');

        return $this->successResponse(null, "Faculty member {$name} removed successfully.");
    }
}
