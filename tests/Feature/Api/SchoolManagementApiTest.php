<?php

namespace Tests\Feature\Api;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class SchoolManagementApiTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * Admin email and password that match the AdminUserSeeder.
     */
    private string $adminEmail    = 'ranaimranali2210@gmail.com';
    private string $adminPassword = 'password123';

    /**
     * Strong password that satisfies the RegisterRequest validation
     * (mixed-case, numbers, symbols).
     */
    private string $strongPassword = 'Str0ng!Pass99';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    protected function authenticate(): array
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => $this->adminEmail,
            'password' => $this->adminPassword,
        ]);

        $token = $response->json('data.token');
        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_admin_can_login(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => $this->adminEmail,
            'password' => $this->adminPassword,
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
        // Public registration is disabled by policy (accounts are invitation-only)
        // Verify that self-registration attempts for student, teacher, and parent are forbidden (403)

        // 1. Attempt to register Student
        $studentRes = $this->postJson('/api/auth/register', [
            'name'                  => 'New Student User',
            'email'                 => 'newstudent@example.com',
            'password'              => $this->strongPassword,
            'password_confirmation' => $this->strongPassword,
            'role'                  => 'student',
            'gender'                => 'male',
        ]);

        $studentRes->assertStatus(403)
                   ->assertJsonPath('success', false);

        // 2. Attempt to register Teacher
        $teacherRes = $this->postJson('/api/auth/register', [
            'name'                  => 'New Teacher User',
            'email'                 => 'newteacher@example.com',
            'password'              => $this->strongPassword,
            'password_confirmation' => $this->strongPassword,
            'role'                  => 'teacher',
            'gender'                => 'female',
        ]);

        $teacherRes->assertStatus(403)
                   ->assertJsonPath('success', false);

        // 3. Attempt to register Parent
        $parentRes = $this->postJson('/api/auth/register', [
            'name'                  => 'New Parent User',
            'email'                 => 'newparent@example.com',
            'password'              => $this->strongPassword,
            'password_confirmation' => $this->strongPassword,
            'role'                  => 'parent',
        ]);

        $parentRes->assertStatus(403)
                   ->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_access_me_profile(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/auth/me');

        $response->assertStatus(200)
                 ->assertJsonPath('data.email', $this->adminEmail);
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

    public function test_can_list_attendances(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/attendances');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_list_grades_with_frontend_compatible_aliases(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/grades');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         '*' => ['id', 'name', 'point', 'grade_point', 'mark_from', 'min_mark', 'mark_to', 'max_mark', 'remarks', 'description'],
                     ],
                 ]);
    }

    public function test_can_list_fee_payments(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/fee-payments');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'items',
                         'pagination',
                     ],
                 ]);
    }

    public function test_can_list_timetables(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/timetables');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_retrieve_student_fee_ledger(): void
    {
        $headers = $this->authenticate();

        $response = $this->withHeaders($headers)->getJson('/api/students/1/fee-ledger');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'student',
                         'fee_structures',
                         'payments',
                         'total_invoiced',
                         'total_paid',
                         'outstanding_due',
                     ],
                 ]);
    }
}
