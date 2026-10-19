<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Fee\StoreFeeTypeRequest;
use App\Http\Resources\FeeTypeResource;
use App\Models\FeeType;
use Illuminate\Http\JsonResponse;

class FeeTypeController extends ApiController
{
    public function index(): JsonResponse
    {
        return $this->successResponse(FeeTypeResource::collection(FeeType::all()), 'Fee categories retrieved.');
    }

    public function store(StoreFeeTypeRequest $request): JsonResponse
    {
        $type = FeeType::create($request->validated());
        return $this->successResponse(new FeeTypeResource($type), 'Fee type created.', 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $type = FeeType::find($id);

        if (!$type) {
            return $this->notFoundResponse('Fee type not found.');
        }

        $type->delete();
        return $this->successResponse(null, 'Fee type removed.');
    }
}
