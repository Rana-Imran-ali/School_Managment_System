<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Teacher\StoreTeacherAssignmentRequest;
use App\Http\Resources\TeacherAssignmentResource;
use App\Models\TeacherAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherAssignmentController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = TeacherAssignment::with([
            'teacherProfile.user',
            'schoolClass',
            'section',
            'subject',
            'academicYear',
        ]);

        if ($request->filled('teacher_id')) {
            $query->where('teacher_profile_id', $request->query('teacher_id'));
        }

        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->query('class_id'));
        }

        return $this->successResponse(
            TeacherAssignmentResource::collection($query->get()),
            'Teacher assignments retrieved.'
        );
    }

    public function store(StoreTeacherAssignmentRequest $request): JsonResponse
    {
        $assignment = TeacherAssignment::create($request->validated());
        $this->logActivity('Assigned teacher to class subject', 'Academics');

        return $this->successResponse(
            new TeacherAssignmentResource($assignment->load(['teacherProfile.user', 'subject', 'schoolClass', 'section', 'academicYear'])),
            'Assignment created.',
            201
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $assignment = TeacherAssignment::find($id);

        if (!$assignment) {
            return $this->notFoundResponse('Assignment not found.');
        }

        $assignment->delete();
        return $this->successResponse(null, 'Assignment revoked.');
    }
}
