<?php
header('Content-Type: application/json');

// Config file path
$configFile = 'config.json';

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'load':
        loadConfig();
        break;
    case 'save':
        saveConfig();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

/**
 * Load configuration from JSON file
 */
function loadConfig() {
    global $configFile;
    
    // Create default config if file doesn't exist
    if (!file_exists($configFile)) {
        $defaultConfig = [
            'server' => 'http://localhost:11434',
            'chats' => []
        ];
        
        file_put_contents($configFile, json_encode($defaultConfig, JSON_PRETTY_PRINT));
        echo json_encode($defaultConfig);
        return;
    }
    
    // Read config file
    $config = file_get_contents($configFile);
    
    if ($config === false) {
        echo json_encode(['error' => 'Failed to read config file']);
        return;
    }
    
    // Parse JSON
    $configData = json_decode($config, true);
    
    if ($configData === null) {
        echo json_encode(['error' => 'Invalid JSON in config file']);
        return;
    }
    
    // Ensure the chats key exists
    if (!isset($configData['chats'])) {
        $configData['chats'] = [];
    }
    
    echo json_encode($configData);
}

/**
 * Save configuration to JSON file
 */
function saveConfig() {
    global $configFile;
    
    // Get request body
    $requestData = json_decode(file_get_contents('php://input'), true);
    
    if (!$requestData) {
        echo json_encode(['error' => 'Invalid request data', 'success' => false]);
        return;
    }
    
    // Validate required fields
    if (!isset($requestData['server'])) {
        echo json_encode(['error' => 'Missing server field', 'success' => false]);
        return;
    }
    
    // Make sure chats is an array
    if (!isset($requestData['chats']) || !is_array($requestData['chats'])) {
        $requestData['chats'] = [];
    }
    
    // Log for debugging
    error_log('Saving config: ' . json_encode($requestData));
    
    // Create backup of config
    if (file_exists($configFile)) {
        copy($configFile, $configFile . '.bak');
    }
    
    // Write to config file with options to preserve JSON format
    $jsonOptions = JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    $result = file_put_contents($configFile, json_encode($requestData, $jsonOptions));
    
    if ($result === false) {
        error_log('Failed to write config file');
        echo json_encode(['error' => 'Failed to write config file', 'success' => false]);
        return;
    }
    
    echo json_encode(['success' => true]);
} 