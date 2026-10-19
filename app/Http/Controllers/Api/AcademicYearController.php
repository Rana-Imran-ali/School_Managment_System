<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\AcademicYear\StoreAcademicYearRequest;
use App\Http\Requests\AcademicYear\UpdateAcademicYearRequest;
use App\Http\Resources\AcademicYearResource;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends ApiController
{
    public function index(): JsonResponse
    {
        $years = AcademicYear::orderBy('start_date', 'desc')->get();
        return $this->successResponse(AcademicYearResource::collection($years), 'Academic years retrieved.');
    }

    public function store(StoreAcademicYearRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (!empty($validated['is_current'])) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $year = AcademicYear::create($validated);
        $this->logActivity("Created academic year {$year->name}", 'Academics');

        return $this->successResponse(new AcademicYearResource($year), 'Academic year created.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (!$year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        return $this->successResponse(new AcademicYearResource($year), 'Academic year details retrieved.');
    }

    public function update(UpdateAcademicYearRequest $request, int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (!$year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        $validated = $request->validated();

        if (!empty($validated['is_current'])) {
            AcademicYear::where('is_current', true)->where('id', '!=', $id)->update(['is_current' => false]);
        }

        $year->update($validated);

        return $this->successResponse(new AcademicYearResource($year), 'Academic year updated.');
    }

    public function setCurrent(int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (!$year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        DB::transaction(function () use ($year) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
            $year->update(['is_current' => true]);
        });

        $this->logActivity("Set {$year->name} as active academic year", 'Academics');

        return $this->successResponse(new AcademicYearResource($year), "Active academic session updated to {$year->name}.");
    }

    public function destroy(int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (!$year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        $year->delete();
        return $this->successResponse(null, 'Academic year removed.');
    }
}
