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
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
        }
        .link-text {
            word-break: break-all;
            color: #818cf8;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>EduCore Academy</h1>
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">Student Cloud Platform</p>
        </div>
        <div class="content">
            <p>Dear <strong>{{ $user->name }}</strong>,</p>
            <p>Your student profile has been registered in the EduCore School Management System by the administration.</p>
            <p>To access your student portal (attendance, grades, exam schedules, and timetable), please set up your account password by clicking the button below:</p>
            
            <div class="btn-wrapper">
                <a href="{{ $setPasswordUrl }}" class="btn" target="_blank">Set Your Account Password</a>
            </div>

            <p style="font-size: 14px;">This activation link will expire in <strong>60 minutes</strong>. If you did not expect this invitation, please contact your school administrator.</p>

            <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
                If the button above does not work, copy and paste this link into your web browser:<br>
                <a href="{{ $setPasswordUrl }}" class="link-text">{{ $setPasswordUrl }}</a>
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} EduCore Academy. All rights reserved.
        </div>
    </div>
</body>
</html>

