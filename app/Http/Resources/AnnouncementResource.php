<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    /**
     * Transform the Announcement model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'content'         => $this->content,
            'target_audience' => $this->target_audience,
            'status'          => $this->status,
            'publish_date'    => $this->publish_date?->format('Y-m-d') ?? $this->publish_date,
            'author'          => $this->whenLoaded('author', fn() => [
                'id'   => $this->author->id,
                'name' => $this->author->name,
                'role' => $this->author->role,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
