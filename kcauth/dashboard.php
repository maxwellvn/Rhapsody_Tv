<?php
// Start session and set security headers
session_start();
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https://cdn1.kingschat.online https://dvvu9r5ep0og0.cloudfront.net https://cdn.jsdelivr.net https://kingschat.online; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; font-src 'self' data:;");

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Check if user is logged in
if (!isset($_SESSION['kc_access_token'])) {
    header('Location: index.php?error=' . urlencode('Please login first'));
    exit;
}

// Get success message from session and clear it
$success = isset($_SESSION['success_message']) ? $_SESSION['success_message'] : '';
unset($_SESSION['success_message']);

// Get user data from the correct nested structure
$userData = isset($_SESSION['kc_user']['profile']['user']) ? $_SESSION['kc_user']['profile']['user'] : null;
$userEmail = isset($_SESSION['kc_user']['profile']['email']['address']) ? $_SESSION['kc_user']['profile']['email']['address'] : null;

// Debug information (only in development)
$debug_info = [];
if ($_SERVER['REMOTE_ADDR'] === '127.0.0.1' || $_SERVER['REMOTE_ADDR'] === '::1') {
    $debug_info['Session Data'] = $_SESSION;
    // Remove sensitive data from debug info
    if (isset($debug_info['Session Data']['kc_access_token'])) {
        $debug_info['Session Data']['kc_access_token'] = '***hidden***';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="KingsChat Dashboard - User Profile">
    <meta name="robots" content="noindex, nofollow">
    <title>Dashboard - KC</title>
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
<body class="bg-gray-50 min-h-screen">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <img src="https://kingschat.online/svg/logo-horizontal.svg" 
                         alt="KingsChat Logo" 
                         class="h-8">
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600">
                        <?php echo isset($userData['name']) ? htmlspecialchars($userData['name']) : ''; ?>
                    </span>
                    <a href="logout.php" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
                        Logout
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <!-- Success Alert -->
        <?php if ($success): ?>
            <div id="successAlert" class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg transition-all duration-500 ease-in-out opacity-100">
                <div class="flex justify-between items-center">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium">
                                <?php echo htmlspecialchars($success); ?>
                            </p>
                        </div>
                    </div>
                    <button onclick="hideSuccessAlert()" class="text-green-500 hover:text-green-600 focus:outline-none">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        <?php endif; ?>

        <!-- Profile Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-kc-blue to-kc-blue-dark">
                <h1 class="text-2xl font-bold text-white">Profile Information</h1>
            </div>

            <div class="p-6">
                <?php if ($userData): ?>
                    <div class="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
                        <?php if (isset($userData['avatar_url'])): ?>
                            <div class="flex-shrink-0">
                                <img src="<?php echo htmlspecialchars($userData['avatar_url']); ?>" 
                                     alt="Profile Picture" 
                                     class="w-32 h-32 rounded-full object-cover ring-4 ring-kc-blue/20"
                                     onerror="this.src='assets/default-avatar.png'">
                            </div>
                        <?php endif; ?>
                        
                        <div class="flex-1">
                            <div class="grid gap-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-sm font-medium text-gray-500 mb-1">Name</div>
                                        <div class="text-gray-900"><?php echo htmlspecialchars($userData['name']); ?></div>
                                    </div>
                                    
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-sm font-medium text-gray-500 mb-1">Username</div>
                                        <div class="text-gray-900">@<?php echo htmlspecialchars($userData['username']); ?></div>
                                    </div>
                                    
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-sm font-medium text-gray-500 mb-1">Email</div>
                                        <div class="text-gray-900"><?php echo htmlspecialchars($userEmail); ?></div>
                                    </div>
                                    
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-sm font-medium text-gray-500 mb-1">User ID</div>
                                        <div class="text-gray-900 font-mono text-sm"><?php echo htmlspecialchars($userData['user_id']); ?></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="text-center py-8">
                        <div class="text-gray-400 mb-2">
                            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p class="text-gray-500">User profile information not available.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </main>

    <script>
        // Auto-hide success alert after 5 seconds
        if (document.getElementById('successAlert')) {
            setTimeout(hideSuccessAlert, 5000);
        }

        function hideSuccessAlert() {
            const alert = document.getElementById('successAlert');
            if (alert) {
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.style.display = 'none';
                }, 500);
            }
        }
    </script>
</body>
</html>