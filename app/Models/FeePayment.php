<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_profile_id',
        'fee_structure_id',
        'fee_type_id',
        'amount_paid',
        'payment_date',
        'payment_method',
        'transaction_id',
        'status',
        'receipt_number',
        'remarks',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_profile_id');
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_profile_id');
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }

    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
