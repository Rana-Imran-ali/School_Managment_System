<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends ApiController
{
    /**
     * Display a listing of system audit trail logs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user:id,name,role,email')->latest();

        if ($request->filled('module')) {
            $query->where('module', $request->query('module'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('activity', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->paginate($request->query('per_page', 25));

        return $this->successResponse([
            'items' => ActivityLogResource::collection($logs),
            'pagination' => [
                'total'        => $logs->total(),
                'per_page'     => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
            ],
        ], 'Audit trail logs retrieved.');
    }
}
