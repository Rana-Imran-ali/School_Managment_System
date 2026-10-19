<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the Message model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'sender_id'   => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'subject'     => $this->subject,
            'message'     => $this->message,
            'is_read'     => (bool) $this->is_read,
            'read_at'     => $this->read_at?->toIso8601String(),
            'sender'      => $this->whenLoaded('sender', fn() => [
                'id'     => $this->sender->id,
                'name'   => $this->sender->name,
                'role'   => $this->sender->role,
                'avatar' => $this->sender->avatar,
            ]),
            'receiver'    => $this->whenLoaded('receiver', fn() => [
                'id'     => $this->receiver->id,
                'name'   => $this->receiver->name,
                'role'   => $this->receiver->role,
                'avatar' => $this->receiver->avatar,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
