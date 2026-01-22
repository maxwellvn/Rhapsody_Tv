<?php
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log all incoming data
error_log('Callback.php started');
error_log('POST data: ' . print_r($_POST, true));
error_log('GET data: ' . print_r($_GET, true));
error_log('Request Headers: ' . print_r(getallheaders(), true));

// Check for data in various places
$input_data = file_get_contents('php://input');
error_log('Raw input data: ' . $input_data);

// Try to get token from various sources
$token = null;

// Check POST data
if (!empty($_POST['accessToken'])) {
    $token = $_POST['accessToken'];
    error_log('Token found in POST data');
}

// Check GET data
if (!$token && !empty($_GET['accessToken'])) {
    $token = $_GET['accessToken'];
    error_log('Token found in GET data');
}

// Check JSON input
if (!$token && !empty($input_data)) {
    $json_data = json_decode($input_data, true);
    if ($json_data && isset($json_data['accessToken'])) {
        $token = $json_data['accessToken'];
        error_log('Token found in JSON data');
        // Store all JSON data in session
        $_SESSION['kc_data'] = $json_data;
        if (isset($json_data['user'])) {
            $_SESSION['kc_user'] = $json_data['user'];
        }
    }
}

// Check Authorization header
$headers = getallheaders();
if (!$token && isset($headers['Authorization'])) {
    $auth_header = $headers['Authorization'];
    if (strpos($auth_header, 'Bearer ') === 0) {
        $token = substr($auth_header, 7);
        error_log('Token found in Authorization header');
    }
}

// If we found a token, store it and redirect to dashboard
if ($token) {
    error_log('Token successfully captured: ' . substr($token, 0, 10) . '...');
    $_SESSION['kc_access_token'] = $token;
    
    // If we haven't stored user data yet, try to get it from other sources
    if (!isset($_SESSION['kc_user'])) {
        if (!empty($_POST['user'])) {
            $_SESSION['kc_user'] = $_POST['user'];
        } elseif (!empty($_GET['user'])) {
            $_SESSION['kc_user'] = $_GET['user'];
        }
    }
    
    // Fetch user profile from KingsChat API
    $ch = curl_init('https://connect.kingsch.at/api/profile');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    error_log('Profile API Response Code: ' . $httpCode);
    error_log('Profile API Response: ' . $response);

    if ($httpCode === 200) {
        $userData = json_decode($response, true);
        if ($userData) {
            $_SESSION['kc_user'] = $userData;
            error_log('User data stored in session');

            // Send welcome message to user's KingsChat
            error_log('Full user data: ' . print_r($userData, true));
            
            // Try to get user ID from the correct path in userData
            $userId = null;
            if (isset($userData['user_id'])) {
                $userId = $userData['user_id'];
            } elseif (isset($userData['profile']['user_id'])) {
                $userId = $userData['profile']['user_id'];
            } elseif (isset($userData['user']['user_id'])) {
                $userId = $userData['user']['user_id'];
            }
            
            error_log('Found User ID: ' . ($userId ?? 'Not found'));
            
            if ($userId) {
                // First create a chat session
                $createChatEndpoint = 'https://connect.kingsch.at/api/chat/create';
                $createChatData = [
                    'type' => 'private',
                    'participants' => [$userId]
                ];

                error_log('Attempting to create chat session with data: ' . print_r($createChatData, true));

                $ch = curl_init($createChatEndpoint);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_POSTFIELDS => json_encode($createChatData),
                    CURLOPT_HTTPHEADER => [
                        'Authorization: Bearer ' . $token,
                        'Content-Type: application/json',
                        'Accept: application/json',
                        'X-Client-Id: com.kingschat',
                        'X-Client-Version: web-2.0',
                        'X-Device-Id: web',
                        'X-Platform: web'
                    ]
                ]);

                $chatResponse = curl_exec($ch);
                $chatHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $chatError = curl_error($ch);
                curl_close($ch);

                error_log('Chat Creation Response Code: ' . $chatHttpCode);
                error_log('Chat Creation Response: ' . $chatResponse);
                
                if ($chatHttpCode === 200 || $chatHttpCode === 201) {
                    $chatData = json_decode($chatResponse, true);
                    $chatId = $chatData['chat_id'] ?? null;
                    
                    if ($chatId) {
                        // Now send message in the established chat
                        $messageEndpoint = 'https://connect.kingsch.at/api/chat/' . $chatId . '/messages';
                        $messageData = [
                            'type' => 'text',
                            'content' => 'Welcome back! You have successfully logged in to your KingsChat account.'
                        ];

                        error_log('Sending message to chat ' . $chatId . ' with data: ' . print_r($messageData, true));

                        $ch = curl_init($messageEndpoint);
                        curl_setopt_array($ch, [
                            CURLOPT_RETURNTRANSFER => true,
                            CURLOPT_POST => true,
                            CURLOPT_POSTFIELDS => json_encode($messageData),
                            CURLOPT_HTTPHEADER => [
                                'Authorization: Bearer ' . $token,
                                'Content-Type: application/json',
                                'Accept: application/json',
                                'X-Client-Id: com.kingschat',
                                'X-Client-Version: web-2.0',
                                'X-Device-Id: web',
                                'X-Platform: web'
                            ]
                        ]);

                        $messageResponse = curl_exec($ch);
                        $messageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                        $messageError = curl_error($ch);
                        curl_close($ch);

                        error_log('Message API Response Code: ' . $messageHttpCode);
                        error_log('Message API Response: ' . $messageResponse);
                        if ($messageError) {
                            error_log('Message API Error: ' . $messageError);
                        }
                    } else {
                        error_log('Failed to get chat ID from response');
                    }
                } else {
                    error_log('Failed to create chat session');
                }
            } else {
                error_log('Could not find user ID in any expected location in user data');
            }

            // Store success message in session instead of URL parameter
            $_SESSION['success_message'] = 'Successfully logged in to KingsChat!';
            header('Location: dashboard.php');
            exit;
        }
    }
    
    error_log('Failed to fetch user profile');
    header('Location: index.php?error=' . urlencode('Failed to fetch user profile'));
    exit;
}

// If we get here, no token was found
$error_message = 'No authentication data received';
error_log('Login error: ' . $error_message);
error_log('$_SESSION contents: ' . print_r($_SESSION, true));
header('Location: index.php?error=' . urlencode($error_message));
exit;
?> 