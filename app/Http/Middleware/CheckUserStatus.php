<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * FLAW 11 fix: Validates user status on EVERY authenticated request.
 * Without this, a suspended/inactive user whose token was issued before
 * suspension retains full API access until the token naturally expires.
 */
class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== 'active') {
            // Revoke current token immediately so they cannot reuse it
            $user->currentAccessToken()?->delete();

            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended or deactivated. Please contact the administrator.',
            ], 403);
        }

        return $next($request);
    }
}
