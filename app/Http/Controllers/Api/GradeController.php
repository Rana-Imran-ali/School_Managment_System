<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Grade\StoreGradeRequest;
use App\Http\Requests\Grade\UpdateGradeRequest;
use App\Http\Resources\GradeResource;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;

class GradeController extends ApiController
{
    public function index(): JsonResponse
    {
        $grades = Grade::orderBy('mark_from', 'desc')->get();
        return $this->successResponse(GradeResource::collection($grades), 'Grades retrieved.');
    }

    public function store(StoreGradeRequest $request): JsonResponse
    {
        $grade = Grade::create($request->validated());
        return $this->successResponse(new GradeResource($grade), 'Grading tier created.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return $this->notFoundResponse('Grade tier not found.');
        }

        return $this->successResponse(new GradeResource($grade), 'Grade tier details.');
    }

    public function update(UpdateGradeRequest $request, int $id): JsonResponse
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return $this->notFoundResponse('Grade tier not found.');
        }

        $grade->update($request->validated());
        return $this->successResponse(new GradeResource($grade), 'Grade tier updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return $this->notFoundResponse('Grade tier not found.');
        }

        $grade->delete();
        return $this->successResponse(null, 'Grade tier removed.');
    }
}
