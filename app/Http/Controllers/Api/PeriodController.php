<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Period\StorePeriodRequest;
use App\Http\Requests\Period\UpdatePeriodRequest;
use App\Http\Resources\PeriodResource;
use App\Models\Period;
use Illuminate\Http\JsonResponse;

class PeriodController extends ApiController
{
    public function index(): JsonResponse
    {
        $periods = Period::orderBy('start_time')->get();
        return $this->successResponse(PeriodResource::collection($periods), 'Periods retrieved.');
    }

    public function store(StorePeriodRequest $request): JsonResponse
    {
        $period = Period::create($request->validated());
        return $this->successResponse(new PeriodResource($period), 'Period created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $period = Period::find($id);

        if (!$period) {
            return $this->notFoundResponse('Period not found.');
        }

        return $this->successResponse(new PeriodResource($period), 'Period details retrieved.');
    }

    public function update(UpdatePeriodRequest $request, int $id): JsonResponse
    {
        $period = Period::find($id);

        if (!$period) {
            return $this->notFoundResponse('Period not found.');
        }

        $period->update($request->validated());
        return $this->successResponse(new PeriodResource($period), 'Period updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $period = Period::find($id);

        if (!$period) {
            return $this->notFoundResponse('Period not found.');
        }

        $period->delete();
        return $this->successResponse(null, 'Period deleted.');
    }
}
