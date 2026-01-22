<?php
session_start();
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https://cdn1.kingschat.online https://dvvu9r5ep0og0.cloudfront.net https://cdn.jsdelivr.net https://kingschat.online; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; font-src 'self' data:;");

// If already logged in, redirect to dashboard
if (isset($_SESSION['kc_access_token'])) {
    header('Location: dashboard.php');
    exit;
}

// Handle error messages
$error = isset($_GET['error']) ? $_GET['error'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="KingsChat Login">
    <meta name="robots" content="noindex, nofollow">
    <title>Login - KC</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'kc-blue': '#4A90E2',
                        'kc-blue-dark': '#357ABD',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
        <div class="text-center mb-10">
            <img src="https://kingschat.online/svg/logo-horizontal.svg" 
                 alt="KingsChat Logo" 
                 class="h-14 mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p class="text-sm text-gray-600">
                Sign in to continue to your account
            </p>
        </div>

        <?php if ($error): ?>
            <div class="rounded-lg bg-red-50 p-4 mb-6 animate-fade-in">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-red-800">
                            <?php echo htmlspecialchars($error); ?>
                        </p>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <div class="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100 backdrop-blur-sm backdrop-filter">
            <div class="flex flex-col items-center space-y-6">
                <button onclick="loginWithKingschat()" 
                        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-kc-blue hover:bg-kc-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kc-blue transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg class="h-5 w-5 text-white/80 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                    </span>
                    Continue with KingsChat
                </button>
                
                <p class="text-xs text-center text-gray-500">
                    By continuing, you agree to KingsChat's 
                    <a href="#" class="text-kc-blue hover:text-kc-blue-dark">Terms of Service</a> and 
                    <a href="#" class="text-kc-blue hover:text-kc-blue-dark">Privacy Policy</a>
                </p>
            </div>
        </div>
    </div>

    <script>
        function loginWithKingschat() {
            const clientId = 'com.kingschat';
            const scopes = ['conference_calls', 'profile'];
            
            // Get the full URL of the callback page
            const currentUrl = window.location.href;
            const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
            const callbackUrl = baseUrl + 'callback.php';
            
            // Construct the login URL with all necessary parameters
            const params = {
                client_id: clientId,
                scopes: JSON.stringify(scopes),
                redirect_uri: callbackUrl,
                response_type: 'token',
                post_redirect: true
            };

            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');

            const loginUrl = `https://accounts.kingsch.at/?${queryString}`;
            
            // Add loading state to button
            const button = document.querySelector('button');
            button.disabled = true;
            button.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
            
            // Redirect after a short delay to show loading state
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 500);
        }
    </script>
</body>
</html> 