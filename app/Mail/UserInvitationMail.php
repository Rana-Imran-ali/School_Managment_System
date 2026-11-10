<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $setPasswordUrl;
    public string $roleLabel;
    public ?string $initialPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $setPasswordUrl, ?string $initialPassword = null)
    {
        $this->user = $user;
        $this->setPasswordUrl = $setPasswordUrl;
        $this->roleLabel = ucfirst($user->role ?? 'User');
        $this->initialPassword = $initialPassword;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Welcome to EduCore - Set Your {$this->roleLabel} Account Password",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.user-invitation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

