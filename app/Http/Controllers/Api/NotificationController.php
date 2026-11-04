<?php

namespace App\Http\Controllers\Api;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends ApiController
{
    /**
     * Retrieve notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $limit = min((int) $request->query('limit', 30), 100);

        $notifications = Notification::where('user_id', $userId)
            ->latest()
            ->take($limit)
            ->get();

        $unreadCount = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return $this->successResponse([
            'items'        => $notifications,
            'unread_count' => $unreadCount,
        ], 'Notifications retrieved.');
    }

    /**
     * Retrieve unread notifications count for the authenticated user.
     */
    public function unreadCount(): JsonResponse
    {
        $userId = Auth::id();
        $count = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return $this->successResponse([
            'unread_count' => $count,
        ], 'Unread count retrieved.');
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        $userId = Auth::id();
        $notification = Notification::where('user_id', $userId)->find($id);

        if (!$notification) {
            return $this->notFoundResponse('Notification not found.');
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        $unreadCount = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return $this->successResponse([
            'notification' => $notification,
            'unread_count' => $unreadCount,
        ], 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(): JsonResponse
    {
        $userId = Auth::id();

        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->successResponse([
            'unread_count' => 0,
        ], 'All notifications marked as read.');
    }

    /**
     * Delete a notification.
     */
    public function destroy(int $id): JsonResponse
    {
        $userId = Auth::id();
        $notification = Notification::where('user_id', $userId)->find($id);

        if (!$notification) {
            return $this->notFoundResponse('Notification not found.');
        }

        $notification->delete();

        $unreadCount = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return $this->successResponse([
            'unread_count' => $unreadCount,
        ], 'Notification removed.');
    }
}

