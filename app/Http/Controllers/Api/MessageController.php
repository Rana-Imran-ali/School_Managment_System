<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\NotificationSent;
use App\Models\Notification;
use Illuminate\Support\Str;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends ApiController
{
    /**
     * Retrieve inbox messages for the authenticated user.
     */
    public function inbox(Request $request): JsonResponse
    {
        $userId = Auth::id() ?? 1;
        $messages = Message::with('sender:id,name,role')
            ->where('receiver_id', $userId)
            ->latest()
            ->paginate($request->query('per_page', 20));

        return $this->successResponse([
            'items' => MessageResource::collection($messages),
            'pagination' => [
                'total'        => $messages->total(),
                'per_page'     => $messages->perPage(),
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
            ],
        ], 'Inbox messages retrieved.');
    }

    /**
     * Retrieve sent messages dispatched by the authenticated user.
     */
    public function sent(Request $request): JsonResponse
    {
        $userId = Auth::id() ?? 1;
        $messages = Message::with('receiver:id,name,role')
            ->where('sender_id', $userId)
            ->latest()
            ->paginate($request->query('per_page', 20));

        return $this->successResponse([
            'items' => MessageResource::collection($messages),
            'pagination' => [
                'total'        => $messages->total(),
                'per_page'     => $messages->perPage(),
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
            ],
        ], 'Sent messages retrieved.');
    }

    /**
     * Retrieve complete conversation thread with a specific contact.
     */
    public function conversation(int $contactId): JsonResponse
    {
        $userId = Auth::id() ?? 1;

        $thread = Message::with(['sender:id,name,role', 'receiver:id,name,role'])
            ->where(function ($q) use ($userId, $contactId) {
                $q->where('sender_id', $userId)->where('receiver_id', $contactId);
            })
            ->orWhere(function ($q) use ($userId, $contactId) {
                $q->where('sender_id', $contactId)->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages sent by contact as read
        Message::where('sender_id', $contactId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->successResponse(
            MessageResource::collection($thread),
            'Conversation thread retrieved.'
        );
    }

    /**
     * Send a new direct message.
     */
    public function store(StoreMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $message = Message::create([
            'sender_id'   => Auth::id() ?? 1,
            'receiver_id' => $validated['receiver_id'],
            'subject'     => $validated['subject'] ?? null,
            'message'     => $validated['message'],
            'is_read'     => false,
        ]);

        $message->load(['sender:id,name,role', 'receiver:id,name,role']);

        try {
            broadcast(new MessageSent($message));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('WebSocket broadcast failed for MessageSent: ' . $e->getMessage());
        }

        // Create and broadcast an in-app notification for the receiver
        try {
            $senderName = $message->sender?->name ?? 'A user';
            $notification = Notification::create([
                'user_id' => $message->receiver_id,
                'type'    => 'message',
                'title'   => 'New message from ' . $senderName,
                'message' => Str::limit($message->message, 80),
                'link'    => '/messages',
                'data'    => [
                    'message_id' => $message->id,
                    'sender_id'  => $message->sender_id,
                ],
            ]);
            broadcast(new NotificationSent($notification));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Notification dispatch failed for message: ' . $e->getMessage());
        }

        return $this->successResponse(
            new MessageResource($message),
            'Message dispatched successfully.',
            201
        );
    }
}
