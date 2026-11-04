<?php

namespace App\Events;

use App\Models\Announcement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnnouncementCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Announcement $announcement;

    /**
     * Create a new event instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('announcements'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'AnnouncementCreated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'content' => $this->announcement->content,
            'target_audience' => $this->announcement->target_audience,
            'publish_date' => $this->announcement->publish_date?->format('Y-m-d') ?? date('Y-m-d'),
            'status' => $this->announcement->status,
            'created_by' => $this->announcement->created_by,
            'author' => $this->announcement->author ? [
                'id' => $this->announcement->author->id,
                'name' => $this->announcement->author->name,
                'role' => $this->announcement->author->role,
            ] : null,
        ];
    }
}

