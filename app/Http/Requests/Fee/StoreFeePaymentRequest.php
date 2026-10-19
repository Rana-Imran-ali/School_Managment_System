<?php

namespace App\Http\Requests\Fee;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_profile_id' => ['required', 'exists:student_profiles,id'],
            'fee_type_id'        => ['nullable', 'exists:fee_types,id'],
            'fee_structure_id'   => ['nullable', 'exists:fee_structures,id'],
            'amount_paid'        => ['required', 'numeric', 'min:0.01'],
            'payment_date'       => ['required', 'date'],
            'payment_method'     => ['required', 'in:cash,card,bank_transfer,online'],
            'transaction_id'     => ['nullable', 'string', 'max:100'],
            'status'             => ['required', 'in:paid,partial,pending'],
            'remarks'            => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount_paid.min' => 'Payment amount must be at least 0.01.',
            'payment_method.in' => 'Payment method must be cash, card, bank transfer, or online.',
        ];
    }
}
