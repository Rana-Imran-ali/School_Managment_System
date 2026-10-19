<?php

namespace App\Http\Requests\Period;

use Illuminate\Foundation\Http\FormRequest;

class StorePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:100',
            'start_time' => 'required',
            'end_time'   => 'required',
            'is_break'   => 'boolean',
        ];
    }
}
