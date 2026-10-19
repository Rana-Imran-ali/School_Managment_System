<?php

namespace App\Contracts\Services;

use App\Models\Exam;
use App\Models\ExamResult;
use Illuminate\Database\Eloquent\Collection;

interface ExamServiceInterface
{
    public function getExams(array $filters = []): Collection;

    public function createExam(array $data): Exam;

    public function recordResults(int $examId, array $resultsData): array;

    public function getStudentReportCard(int $studentId, ?int $examId = null): array;
}
