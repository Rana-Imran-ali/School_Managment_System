<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'point',
        'mark_from',
        'mark_to',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'point' => 'decimal:2',
            'mark_from' => 'decimal:2',
            'mark_to' => 'decimal:2',
        ];
    }

    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }
}
