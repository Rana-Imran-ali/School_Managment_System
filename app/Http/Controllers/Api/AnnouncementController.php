<?php

namespace App\Http\Controllers\Api;

use App\Events\AnnouncementCreated;
use App\Events\NotificationSent;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $validated['created_by']   = $request->user()->id;

        $announcement = Announcement::create($validated);
        $announcement->load('author:id,name,role');
        $this->logActivity("Published circular notice '{$announcement->title}' to {$announcement->target_audience}", 'Announcements');

        try {
            broadcast(new AnnouncementCreated($announcement));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('WebSocket broadcast failed for AnnouncementCreated: ' . $e->getMessage());
        }

        // Notify target audience members via in-app notification
        try {
            $userQuery = User::query();
            if ($announcement->target_audience !== 'all') {
                $role = match ($announcement->target_audience) {
                    'teachers' => 'teacher',
                    'students' => 'student',
                    'parents'  => 'parent',
                    default    => null,
                };
                if ($role) {
                    $userQuery->where('role', $role);
                }
            }
            $targetUsers = $userQuery->where('id', '!=', $request->user()->id)->take(100)->get();
            foreach ($targetUsers as $targetUser) {
                $notif = Notification::create([
                    'user_id' => $targetUser->id,
                    'type'    => 'announcement',
                    'title'   => 'Notice: ' . $announcement->title,
                    'message' => Str::limit($announcement->content, 80),
                    'link'    => '/announcements',
                    'data'    => ['announcement_id' => $announcement->id],
                ]);
                broadcast(new NotificationSent($notif));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Announcement notification dispatch failed: ' . $e->getMessage());
        }

        return $this->successResponse(
            new AnnouncementResource($announcement),
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
