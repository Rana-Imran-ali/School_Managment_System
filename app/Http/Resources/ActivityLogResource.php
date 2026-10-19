<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    /**
     * Transform the ActivityLog model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'activity'   => $this->activity,
            'module'     => $this->module,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'user'       => $this->whenLoaded('user', fn() => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'role'  => $this->user->role,
                'email' => $this->user->email,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
