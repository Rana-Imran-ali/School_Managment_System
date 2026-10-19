<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'numeric_name',
        'numeric_value',
        'description',
    ];

    public function getNumericValueAttribute(): ?int
    {
        return $this->numeric_name;
    }

    public function setNumericValueAttribute(?int $value): void
    {
        $this->attributes['numeric_name'] = $value;
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(StudentProfile::class, 'current_class_id');
    }

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}
