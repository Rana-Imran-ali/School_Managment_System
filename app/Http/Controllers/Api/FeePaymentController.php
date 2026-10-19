<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\FeeServiceInterface;
use App\Http\Requests\Fee\StoreFeePaymentRequest;
use App\Http\Resources\FeePaymentResource;
use App\Models\FeePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeePaymentController extends ApiController
{
    protected FeeServiceInterface $feeService;

    public function __construct(FeeServiceInterface $feeService)
    {
        $this->feeService = $feeService;
    }

    /**
     * Display a listing of fee transaction payments.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = FeePayment::with(['studentProfile.user', 'feeType', 'feeStructure']);

        // IDOR Protection: Students see only their payments; Parents only their children's
        if ($user->role === 'student') {
            $query->where('student_profile_id', $user->studentProfile?->id ?? 0);
        } elseif ($user->role === 'parent') {
            $childIds = \App\Models\StudentProfile::where('parent_id', $user->parentProfile?->id ?? 0)->pluck('id');
            $query->whereIn('student_profile_id', $childIds);
        } elseif ($request->filled('student_id')) {
            $query->where('student_profile_id', $request->query('student_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhere('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile.user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->latest('payment_date')->paginate($request->query('per_page', 15));

        return $this->successResponse([
            'items' => FeePaymentResource::collection($payments),
            'pagination' => [
                'total'        => $payments->total(),
                'per_page'     => $payments->perPage(),
                'current_page' => $payments->currentPage(),
                'last_page'    => $payments->lastPage(),
            ],
        ], 'Fee transactions retrieved.');
    }

    /**
     * Record a new tuition or lab fee payment.
     */
    public function store(StoreFeePaymentRequest $request): JsonResponse
    {
        $payment = $this->feeService->recordPayment($request->validated());

        $this->logActivity("Recorded fee payment {$payment->receipt_number} of \${$payment->amount_paid}", 'Finance');

        return $this->successResponse(
            new FeePaymentResource($payment),
            'Payment processed and receipt issued.',
            201
        );
    }

    /**
     * Retrieve the printable fee voucher receipt.
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $payment = FeePayment::with(['studentProfile.user', 'studentProfile.currentClass', 'feeType'])->find($id);

        if (!$payment) {
            return $this->notFoundResponse('Fee transaction record not found.');
        }

        $user = $request->user();
        if ($user->role === 'student' && $payment->student_profile_id !== $user->studentProfile?->id) {
            return $this->errorResponse('Access denied. You can only view your own receipts.', null, 403);
        }
        if ($user->role === 'parent') {
            $isChild = \App\Models\StudentProfile::where('id', $payment->student_profile_id)
                ->where('parent_id', $user->parentProfile?->id)
                ->exists();
            if (!$isChild) {
                return $this->errorResponse('Access denied. You can only view your child receipts.', null, 403);
            }
        }

        return $this->successResponse(new FeePaymentResource($payment), 'Receipt details retrieved.');
    }
}
