<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\ParentServiceInterface;
use App\Http\Requests\ParentProfile\StoreParentRequest;
use App\Http\Requests\ParentProfile\UpdateParentRequest;
use App\Http\Resources\ParentResource;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentProfileController extends ApiController
{
    protected ParentServiceInterface $parentService;

    public function __construct(ParentServiceInterface $parentService)
    {
        $this->parentService = $parentService;
    }

    /**
     * Display a listing of parent guardians.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search']);
        $perPage = (int) $request->query('per_page', 15);

        $parents = $this->parentService->getParents($filters, $perPage);

        return $this->successResponse([
            'items' => ParentResource::collection($parents),
            'pagination' => [
                'total'        => $parents->total(),
                'per_page'     => $parents->perPage(),
                'current_page' => $parents->currentPage(),
                'last_page'    => $parents->lastPage(),
            ],
        ], 'Parents retrieved successfully.');
    }

    /**
     * Register a new parent profile.
     */
    public function store(StoreParentRequest $request): JsonResponse
    {
        $parent = $this->parentService->createParent($request->validated());

        $this->logActivity("Registered guardian {$parent->user->name}", 'Parents');

        return $this->successResponse(new ParentResource($parent), 'Parent profile registered successfully.', 201);
    }

    /**
     * Display the specified parent profile and their ward children.
     */
    public function show(int $id): JsonResponse
    {
        $parent = $this->parentService->findParent($id);

        if (!$parent) {
            return $this->notFoundResponse('Parent record not found.');
        }

        return $this->successResponse(new ParentResource($parent), 'Parent details retrieved.');
    }

    /**
     * Update the specified parent profile.
     */
    public function update(UpdateParentRequest $request, int $id): JsonResponse
    {
        $parent = $this->parentService->findParent($id);

        if (!$parent) {
            return $this->notFoundResponse('Parent record not found.');
        }

        $updated = $this->parentService->updateParent($parent, $request->validated());

        return $this->successResponse(new ParentResource($updated), 'Parent profile updated successfully.');
    }

    /**
     * List all students affiliated with this parent profile.
     */
    public function children(int $id): JsonResponse
    {
        $parent = $this->parentService->findParent($id);

        if (!$parent) {
            return $this->notFoundResponse('Parent record not found.');
        }

        return $this->successResponse(
            StudentResource::collection($parent->students),
            'Parent ward students retrieved.'
        );
    }

    /**
     * Remove the specified parent record.
     */
    public function destroy(int $id): JsonResponse
    {
        $parent = $this->parentService->findParent($id);

        if (!$parent) {
            return $this->notFoundResponse('Parent record not found.');
        }

        $this->parentService->deleteParent($parent);

        return $this->successResponse(null, 'Parent profile deleted.');
    }
}
