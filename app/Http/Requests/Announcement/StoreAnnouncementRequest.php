<?php

namespace App\Http\Requests\Announcement;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'           => ['required', 'string', 'max:255'],
            'content'         => ['required', 'string'],
            'target_audience' => ['required', 'in:all,students,teachers,parents'],
            'publish_date'    => ['nullable', 'date'],
            'status'          => ['sometimes', 'in:published,draft'],
        ];
    }
}
