<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Auth;

abstract class ApiController extends Controller
{
    /**
     * Send a standardized success JSON response.
     */
    protected function successResponse(mixed $data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $statusCode);
    }

    /**
     * Send a standardized error JSON response.
     */
    protected function errorResponse(string $message = 'An error occurred', mixed $errors = null, int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $statusCode);
    }

    /**
     * Send a standardized not-found response.
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, null, 404);
    }

    /**
     * Send a standardized paginated response.
     */
    protected function paginatedResponse(mixed $paginator, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $paginator->items(),
            'pagination' => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }

    /**
     * Record an audit activity log in the database.
     * FLAW 13 fix: accepts an explicit $userId so log is never null during login
     * (before the Sanctum guard resolves the user).
     */
    protected function logActivity(string $activity, ?string $module = null, ?int $userId = null): void
    {
        try {
            ActivityLog::create([
                'user_id'    => $userId ?? Auth::id(),
                'activity'   => $activity,
                'module'     => $module,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Silently handle log failures to avoid disrupting the primary operation
        }
    }
}
