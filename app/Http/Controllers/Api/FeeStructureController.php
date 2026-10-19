<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\FeeServiceInterface;
use App\Http\Requests\Fee\StoreFeeStructureRequest;
use App\Http\Resources\FeeStructureResource;
use App\Models\FeeStructure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeeStructureController extends ApiController
{
    protected FeeServiceInterface $feeService;

    public function __construct(FeeServiceInterface $feeService)
    {
        $this->feeService = $feeService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['class_id', 'academic_year_id']);
        $structures = $this->feeService->getFeeStructures($filters);

        return $this->successResponse(FeeStructureResource::collection($structures), 'Fee structures retrieved.');
    }

    public function store(StoreFeeStructureRequest $request): JsonResponse
    {
        $structure = $this->feeService->createFeeStructure($request->validated());

        $this->logActivity('Created class fee schedule tariff', 'Finance');

        return $this->successResponse(new FeeStructureResource($structure), 'Fee structure created.', 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $structure = FeeStructure::find($id);

        if (!$structure) {
            return $this->notFoundResponse('Fee structure not found.');
        }

        $structure->delete();
        return $this->successResponse(null, 'Fee structure removed.');
    }
}
