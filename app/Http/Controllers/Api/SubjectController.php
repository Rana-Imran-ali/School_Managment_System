<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Subject\StoreSubjectRequest;
use App\Http\Requests\Subject\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;

class SubjectController extends ApiController
{
    public function index(): JsonResponse
    {
        $subjects = Subject::with('schoolClass')->get();
        return $this->successResponse(SubjectResource::collection($subjects), 'Subjects retrieved.');
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = Subject::create($request->validated());
        $this->logActivity("Created subject {$subject->name} ({$subject->code})", 'Academics');

        return $this->successResponse(new SubjectResource($subject), 'Subject registered successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $subject = Subject::with('schoolClass')->find($id);

        if (!$subject) {
            return $this->notFoundResponse('Subject not found.');
        }

        return $this->successResponse(new SubjectResource($subject), 'Subject details retrieved.');
    }

    public function update(UpdateSubjectRequest $request, int $id): JsonResponse
    {
        $subject = Subject::find($id);

        if (!$subject) {
            return $this->notFoundResponse('Subject not found.');
        }

        $subject->update($request->validated());
        return $this->successResponse(new SubjectResource($subject), 'Subject updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $subject = Subject::find($id);

        if (!$subject) {
            return $this->notFoundResponse('Subject not found.');
        }

        $subject->delete();
        return $this->successResponse(null, 'Subject removed.');
    }
}
