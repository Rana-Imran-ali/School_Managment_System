<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends ApiController
{
    /**
     * Display a listing of announcements, filterable by target audience.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with('author:id,name,role')->latest('publish_date');

        if ($request->filled('audience')) {
            $audience = $request->query('audience');
            $query->where(function ($q) use ($audience) {
                $q->where('target_audience', $audience)
                  ->orWhere('target_audience', 'all');
            });
        }

        return $this->successResponse(
            AnnouncementResource::collection($query->get()),
            'Announcements retrieved.'
        );
    }

    /**
     * Store a newly created circular/announcement.
     */
    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['publish_date'] = $validated['publish_date'] ?? date('Y-m-d');
        $validated['created_by']   = Auth::id() ?? 1;

        $announcement = Announcement::create($validated);
        $this->logActivity("Published circular notice '{$announcement->title}' to {$announcement->target_audience}", 'Announcements');

        return $this->successResponse(
            new AnnouncementResource($announcement->load('author:id,name,role')),
            'Announcement published successfully.',
            201
        );
    }

    /**
     * Remove an announcement.
     */
    public function destroy(int $id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return $this->notFoundResponse('Announcement not found.');
        }

        $announcement->delete();
        return $this->successResponse(null, 'Announcement removed.');
    }
}
