<?php

namespace Tests\Feature\Api;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class SchoolManagementApiTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    protected function authenticate(): array
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'admin@educore.edu',
            'password' => 'password123',
        ]);

        $token = $response->json('data.token');
        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_admin_can_login(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'admin@educore.edu',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'token',
                         'user' => ['id', 'name', 'email', 'role'],
                     ],
                 ]);
    }

    public function test_student_teacher_and_parent_can_register(): void
    {
        // 1. Register Student
        $studentRes = $this->postJson('/api/auth/register', [
            'name'                  => 'New Student User',
            'email'                 => 'newstudent@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'student',
            'gender'                => 'male',
        ]);

        $studentRes->assertStatus(201)
                   ->assertJsonPath('data.user.role', 'student');

        // 2. Register Teacher
        $teacherRes = $this->postJson('/api/auth/register', [
            'name'                  => 'New Teacher User',
            'email'                 => 'newteacher@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'teacher',
            'gender'                => 'female',
        ]);

        $teacherRes->assertStatus(201)
                   ->assertJsonPath('data.user.role', 'teacher');

        // 3. Register Parent
        $parentRes = $this->postJson('/api/auth/register', [
            'name'                  => 'New Parent User',
            'email'                 => 'newparent@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'parent',
        ]);

        $parentRes->assertStatus(201)
                   ->assertJsonPath('data.user.role', 'parent');
    }

    public function test_authenticated_user_can_access_me_profile(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/auth/me');

        $response->assertStatus(200)
                 ->assertJsonPath('data.email', 'admin@educore.edu');
    }

    public function test_admin_dashboard_stats_endpoint(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'metrics' => [
                             'total_students',
                             'total_teachers',
                             'total_classes',
                             'total_users',
                         ],
                     ],
                 ]);
    }

    public function test_can_list_students_via_service_layer(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/students');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'items',
                         'pagination',
                     ],
                 ]);
    }

    public function test_can_list_teachers(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/teachers');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'items',
                         'pagination',
                     ],
                 ]);
    }

    public function test_can_retrieve_student_report_card(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/students/1/report-card');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'student',
                         'results',
                         'summary',
                     ],
                 ]);
    }
}
