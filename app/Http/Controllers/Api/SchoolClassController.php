<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SchoolClass\StoreSchoolClassRequest;
use App\Http\Requests\SchoolClass\UpdateSchoolClassRequest;
use App\Http\Resources\SchoolClassResource;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;

class SchoolClassController extends ApiController
{
    public function index(): JsonResponse
    {
        $classes = SchoolClass::with('sections')->withCount('students')->get();
        return $this->successResponse(SchoolClassResource::collection($classes), 'Classes retrieved.');
    }

    public function store(StoreSchoolClassRequest $request): JsonResponse
    {
        $class = SchoolClass::create($request->validated());
        $this->logActivity("Created class {$class->name}", 'Academics');

        return $this->successResponse(new SchoolClassResource($class), 'Class created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $class = SchoolClass::with(['sections', 'students.user'])->withCount('students')->find($id);

        if (!$class) {
            return $this->notFoundResponse('Class not found.');
        }

        return $this->successResponse(new SchoolClassResource($class), 'Class details retrieved.');
    }

    public function update(UpdateSchoolClassRequest $request, int $id): JsonResponse
    {
        $class = SchoolClass::find($id);

        if (!$class) {
            return $this->notFoundResponse('Class not found.');
        }

        $class->update($request->validated());
        return $this->successResponse(new SchoolClassResource($class), 'Class updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $class = SchoolClass::find($id);

        if (!$class) {
            return $this->notFoundResponse('Class not found.');
        }

        $class->delete();
        return $this->successResponse(null, 'Class deleted.');
    }
}
