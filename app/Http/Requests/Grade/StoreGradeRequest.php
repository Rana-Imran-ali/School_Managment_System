<?php

namespace App\Http\Requests\Grade;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => 'required|string|max:10',
            'point'     => 'required|numeric|min:0|max:10',
            'mark_from' => 'required|numeric|min:0|max:100',
            'mark_to'   => 'required|numeric|min:0|max:100|gte:mark_from',
            'remarks'   => 'nullable|string|max:255',
        ];
    }

    /**
     * Prepare the data for validation in case legacy field names are passed.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('grade_point') && !$this->has('point')) {
            $merge['point'] = $this->input('grade_point');
        }
        if ($this->has('min_mark') && !$this->has('mark_from')) {
            $merge['mark_from'] = $this->input('min_mark');
        }
        if ($this->has('max_mark') && !$this->has('mark_to')) {
            $merge['mark_to'] = $this->input('max_mark');
        }
        if ($this->has('description') && !$this->has('remarks')) {
            $merge['remarks'] = $this->input('description');
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }
}
