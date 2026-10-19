<?php

namespace App\Services;

use App\Contracts\Services\ExamServiceInterface;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Grade;
use App\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ExamService implements ExamServiceInterface
{
    public function getExams(array $filters = []): Collection
    {
        $query = Exam::with('academicYear');

        if (!empty($filters['academic_year_id'])) {
            $query->where('academic_year_id', $filters['academic_year_id']);
        }

        return $query->orderBy('start_date', 'desc')->get();
    }

    public function createExam(array $data): Exam
    {
        return Exam::create($data);
    }

    public function recordResults(int $examId, array $resultsData): array
    {
        $grades = Grade::all();

        return DB::transaction(function () use ($examId, $resultsData, $grades) {
            $subjectId = $resultsData['subject_id'];
            $entries   = [];

            foreach ($resultsData['results'] as $item) {
                $obtained = (float) $item['marks_obtained'];
                $total    = (float) ($item['total_marks'] ?? 100);
                $pct      = ($total > 0) ? ($obtained / $total) * 100 : 0;

                // Match grade tier using mark_from/mark_to or fallback to min_mark/max_mark
                $matchedGrade = $grades->first(function ($g) use ($pct) {
                    $min = $g->mark_from ?? $g->min_mark ?? 0;
                    $max = $g->mark_to ?? $g->max_mark ?? 100;
                    return $pct >= $min && $pct <= $max;
                });

                $letter = $matchedGrade ? $matchedGrade->name : 'F';

                $record = ExamResult::updateOrCreate(
                    [
                        'exam_id'            => $examId,
                        'subject_id'         => $subjectId,
                        'student_profile_id' => $item['student_profile_id'],
                    ],
                    [
                        'marks_obtained' => $obtained,
                        'total_marks'    => $total,
                        'grade_id'       => $matchedGrade?->id,
                        'remarks'        => $item['remarks'] ?? null,
                    ]
                );

                $entries[] = $record;
            }

            return $entries;
        });
    }

    public function getStudentReportCard(int $studentId, ?int $examId = null): array
    {
        $student = StudentProfile::with(['user', 'currentClass', 'currentSection'])->findOrFail($studentId);

        $query = ExamResult::with(['exam', 'subject'])
            ->where('student_profile_id', $studentId);

        if ($examId) {
            $query->where('exam_id', $examId);
        }

        $scores = $query->get();

        $totalObtained = $scores->sum('marks_obtained');
        $totalMax      = $scores->sum('total_marks');
        $averagePct    = $totalMax > 0 ? round(($totalObtained / $totalMax) * 100, 2) : 0;

        return [
            'student' => [
                'id'               => $student->id,
                'name'             => $student->user?->name,
                'admission_number' => $student->admission_number,
                'roll_number'      => $student->roll_number,
                'class'            => $student->currentClass?->name,
                'section'          => $student->currentSection?->name,
            ],
            'results' => $scores,
            'summary' => [
                'total_obtained'     => $totalObtained,
                'total_possible'     => $totalMax,
                'overall_percentage' => $averagePct,
                'total_subjects'     => $scores->count(),
            ],
        ];
    }
}
