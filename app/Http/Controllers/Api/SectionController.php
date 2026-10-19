<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Section\StoreSectionRequest;
use App\Http\Requests\Section\UpdateSectionRequest;
use App\Http\Resources\SectionResource;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Section::with('schoolClass')->withCount('students');

        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->query('class_id'));
        }

        return $this->successResponse(SectionResource::collection($query->get()), 'Sections retrieved.');
    }

    public function store(StoreSectionRequest $request): JsonResponse
    {
        $section = Section::create($request->validated());
        return $this->successResponse(new SectionResource($section), 'Section created.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $section = Section::with(['schoolClass', 'students.user'])->withCount('students')->find($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found.');
        }

        return $this->successResponse(new SectionResource($section), 'Section details.');
    }

    public function update(UpdateSectionRequest $request, int $id): JsonResponse
    {
        $section = Section::find($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found.');
        }

        $section->update($request->validated());
        return $this->successResponse(new SectionResource($section), 'Section updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $section = Section::find($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found.');
        }

        $section->delete();
        return $this->successResponse(null, 'Section deleted.');
    }
}
