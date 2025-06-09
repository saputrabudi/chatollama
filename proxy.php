<?php
header('Content-Type: application/json');

// Allow all origins for AJAX requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// If it's an OPTIONS request, just return 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'models':
        getModels();
        break;
    case 'chat':
        handleChat();
        break;
    case 'chat_with_file':
        handleChatWithFile();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

/**
 * Get list of models from Ollama server
 */
function getModels() {
    $server = isset($_GET['server']) ? $_GET['server'] : 'http://localhost:11434';
    
    // Ensure server URL ends with a slash
    if (substr($server, -1) !== '/') {
        $server .= '/';
    }
    
    $url = $server . 'api/tags';
    
    $response = makeRequest($url);
    
    if ($response === false) {
        echo json_encode(['error' => 'Failed to connect to Ollama server']);
        return;
    }
    
    echo $response;
}

/**
 * Handle chat request without file
 */
function handleChat() {
    // Get request body
    $requestData = json_decode(file_get_contents('php://input'), true);
    
    if (!$requestData) {
        echo json_encode(['error' => 'Invalid request data']);
        return;
    }
    
    $model = isset($requestData['model']) ? $requestData['model'] : '';
    $message = isset($requestData['message']) ? $requestData['message'] : '';
    $server = isset($requestData['server']) ? $requestData['server'] : 'http://localhost:11434';
    
    // Validate required fields
    if (empty($model) || empty($message)) {
        echo json_encode(['error' => 'Model and message are required']);
        return;
    }
    
    // Ensure server URL ends with a slash
    if (substr($server, -1) !== '/') {
        $server .= '/';
    }
    
    $url = $server . 'api/chat';
    
    $data = [
        'model' => $model,
        'messages' => [
            [
                'role' => 'user',
                'content' => $message
            ]
        ],
        'stream' => false
    ];
    
    $response = makeRequest($url, 'POST', json_encode($data));
    
    if ($response === false) {
        echo json_encode(['error' => 'Failed to connect to Ollama server']);
        return;
    }
    
    $responseData = json_decode($response, true);
    
    if (isset($responseData['message']['content'])) {
        echo json_encode(['response' => $responseData['message']['content']]);
    } else {
        echo json_encode(['error' => 'Invalid response from Ollama server']);
    }
}

/**
 * Handle chat request with file
 */
function handleChatWithFile() {
    $model = isset($_POST['model']) ? $_POST['model'] : '';
    $message = isset($_POST['message']) ? $_POST['message'] : '';
    $server = isset($_POST['server']) ? $_POST['server'] : 'http://localhost:11434';
    
    // Validate required fields
    if (empty($model)) {
        echo json_encode(['error' => 'Model is required']);
        return;
    }
    
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['error' => 'File upload failed']);
        return;
    }
    
    $file = $_FILES['file'];
    $fileName = $file['name'];
    $fileTmpPath = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileType = $file['type'];
    
    // Read file content
    $fileContent = file_get_contents($fileTmpPath);
    
    if ($fileContent === false) {
        echo json_encode(['error' => 'Failed to read uploaded file']);
        return;
    }
    
    // Base64 encode the file
    $fileBase64 = base64_encode($fileContent);
    
    // Prepare message with file info
    if (empty($message)) {
        $message = "Please analyze this file: $fileName";
    } else {
        $message .= "\n\nFile attached: $fileName";
    }
    
    // Ensure server URL ends with a slash
    if (substr($server, -1) !== '/') {
        $server .= '/';
    }
    
    $url = $server . 'api/chat';
    
    $data = [
        'model' => $model,
        'messages' => [
            [
                'role' => 'user',
                'content' => $message,
                'images' => [$fileBase64]
            ]
        ],
        'stream' => false
    ];
    
    $response = makeRequest($url, 'POST', json_encode($data));
    
    if ($response === false) {
        echo json_encode(['error' => 'Failed to connect to Ollama server']);
        return;
    }
    
    $responseData = json_decode($response, true);
    
    if (isset($responseData['message']['content'])) {
        echo json_encode(['response' => $responseData['message']['content']]);
    } else {
        echo json_encode(['error' => 'Invalid response from Ollama server']);
    }
}

/**
 * Make HTTP request to Ollama server
 */
function makeRequest($url, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 180);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data)
        ]);
    }
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        error_log('cURL error: ' . curl_error($ch));
        curl_close($ch);
        return false;
    }
    
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 400) {
        error_log('HTTP error: ' . $httpCode);
        return false;
    }
    
    return $response;
} 