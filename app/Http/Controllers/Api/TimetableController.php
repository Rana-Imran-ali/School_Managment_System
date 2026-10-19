<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\TimetableServiceInterface;
use App\Http\Requests\Timetable\StoreTimetableRequest;
use App\Http\Resources\TimetableResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimetableController extends ApiController
{
    protected TimetableServiceInterface $timetableService;

    public function __construct(TimetableServiceInterface $timetableService)
    {
        $this->timetableService = $timetableService;
    }

    /**
     * Display timetable slots, filterable by class, section, and day.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['class_id', 'section_id', 'teacher_id', 'day']);
        $slots = $this->timetableService->getTimetable($filters);

        return $this->successResponse(
            TimetableResource::collection($slots),
            'Timetable slots retrieved.'
        );
    }

    /**
     * Schedule a new timetable slot with collision prevention.
     */
    public function store(StoreTimetableRequest $request): JsonResponse
    {
        try {
            $slot = $this->timetableService->createEntry($request->validated());
            $this->logActivity('Assigned timetable lecture slot', 'Timetable');

            return $this->successResponse(
                new TimetableResource($slot),
                'Timetable slot allocated successfully.',
                201
            );
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Remove a timetable lecture slot.
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->timetableService->deleteEntry($id);

        if (!$deleted) {
            return $this->notFoundResponse('Timetable slot not found.');
        }

        return $this->successResponse(null, 'Timetable slot removed.');
    }
}
