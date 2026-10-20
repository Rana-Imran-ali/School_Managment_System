<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Timetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_class_id',
        'section_id',
        'subject_id',
        'teacher_profile_id',
        'period_id',
        'academic_year_id',
        'day_of_week',
        'room_number',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacherProfile(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class, 'teacher_profile_id');
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
