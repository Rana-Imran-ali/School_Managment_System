<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\Services\StudentServiceInterface::class,
            \App\Services\StudentService::class
        );
        $this->app->bind(
            \App\Contracts\Services\TeacherServiceInterface::class,
            \App\Services\TeacherService::class
        );
        $this->app->bind(
            \App\Contracts\Services\AttendanceServiceInterface::class,
            \App\Services\AttendanceService::class
        );
        $this->app->bind(
            \App\Contracts\Services\ExamServiceInterface::class,
            \App\Services\ExamService::class
        );
        $this->app->bind(
            \App\Contracts\Services\FeeServiceInterface::class,
            \App\Services\FeeService::class
        );
        $this->app->bind(
            \App\Contracts\Services\TimetableServiceInterface::class,
            \App\Services\TimetableService::class
        );
        $this->app->bind(
            \App\Contracts\Services\ParentServiceInterface::class,
            \App\Services\ParentService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
