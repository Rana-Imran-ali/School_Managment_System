<?php

namespace Database\Seeders;

use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;

class FeePaymentSeeder extends Seeder
{
    public function run(): void
    {
        $liam = StudentProfile::first();
        $tuition = FeeType::where('name', 'Annual Tuition Fee')->first();
        $structure = FeeStructure::first();

        if ($liam && $tuition) {
            FeePayment::updateOrCreate(
                ['receipt_number' => 'RCP-2026-0081'],
                [
                    'student_profile_id' => $liam->id,
                    'fee_type_id'        => $tuition->id,
                    'fee_structure_id'   => $structure?->id,
                    'amount_paid'        => 2400.00,
                    'payment_date'       => '2026-10-05',
                    'payment_method'     => 'online',
                    'transaction_id'     => 'TXN-9023184',
                    'status'             => 'paid',
                    'remarks'            => 'Full tuition cleared via Stripe Gateway',
                    'recorded_by'        => 1,
                ]
            );
        }
    }
}
