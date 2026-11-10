<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Set Your Password - EduCore</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 580px;
            margin: 0 auto;
            background: #1e293b;
            border-radius: 12px;
            padding: 36px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }
        .header h1 {
            color: #818cf8;
            font-size: 24px;
            margin: 8px 0;
        }
        .badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.2);
            color: #a5b4fc;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
            border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .content {
            font-size: 15px;
            line-height: 1.6;
            color: #cbd5e1;
        }
        .btn-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-weight: 700;
            font-size: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .footer {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
        .link-alt {
            word-break: break-all;
            color: #818cf8;
            font-size: 12px;
        }
        .highlight {
            color: #38bdf8;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="badge">{{ $roleLabel }} Portal</span>
            <h1>EduCore Academy Cloud</h1>
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">Official Invitation & Account Activation</p>
        </div>

        <div class="content">
            <p>Dear <strong>{{ $user->name }}</strong>,</p>

            <p>An official <strong>{{ $roleLabel }}</strong> account has been created for you on the EduCore Academy Management Platform.</p>

            @if(!empty($initialPassword))
            <div style="background: rgba(99, 102, 241, 0.12); border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Temporary Login Credentials:</p>
                <div style="font-size: 14px; color: #f8fafc;">
                    <strong>Email:</strong> <span class="highlight">{{ $user->email }}</span><br>
                    <strong>Password:</strong> <span style="font-family: monospace; color: #38bdf8; font-size: 15px; font-weight: 700;">{{ $initialPassword }}</span>
                </div>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #cbd5e1;">
                    You can log in directly using this temporary password right away, or click the button below to set your own custom password.
                </p>
            </div>
            @endif

            <p>To set your own personal password, please click the button below:</p>

            <div class="btn-wrapper">
                <a href="{{ $setPasswordUrl }}" class="btn">Set My Password & Activate Account</a>
            </div>

            <p style="font-size: 13px; color: #94a3b8;">
                ⚠️ <strong>Important Note:</strong> For security reasons, this activation link will expire in <strong>60 minutes</strong>. Once set, you can sign in directly to your {{ strtolower($roleLabel) }} dashboard using your email (<span class="highlight">{{ $user->email }}</span>) and chosen password.
            </p>

            <p style="font-size: 13px; color: #94a3b8;">
                If the button above does not work, copy and paste the following URL into your browser:
                <br>
                <a href="{{ $setPasswordUrl }}" class="link-alt">{{ $setPasswordUrl }}</a>
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} EduCore Academy. All rights reserved.<br>This is an automated system notification. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>

