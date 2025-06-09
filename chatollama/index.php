<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatOllama</title>
    <!-- Google Fonts - Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Favicon -->
    <link rel="icon" href="assets/img/robot-icon.png" type="image/png">
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- SweetAlert2 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js"></script>
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo-container">
                    <img src="assets/img/robot-icon.png" alt="ChatOllama Logo">
                    <h1>ChatOllama</h1>
                </div>
                <button id="new-chat-btn" class="new-chat-btn">
                    <i class="fas fa-plus"></i> Chat Baru
                </button>
            </div>
            
            <!-- Settings moved here, right after header -->
            <div class="settings">
                <div class="settings-item">
                    <label for="server-input">Server Ollama:</label>
                    <input type="text" id="server-input" placeholder="http://localhost:11434">
                </div>
                <div class="settings-item">
                    <label for="model-select">Model AI:</label>
                    <select id="model-select">
                        <option value="">Pilih Model</option>
                        <!-- Models will be loaded here -->
                    </select>
                </div>
            </div>
            
            <div class="chat-history" id="chat-history">
                <!-- Chat history will be loaded here -->
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="chat-container" id="chat-container">
                <div class="welcome-message" id="welcome-message">
                    <img src="assets/img/robot-icon.png" alt="ChatOllama Logo" class="welcome-logo">
                    <h2>Selamat Datang di ChatOllama</h2>
                    <p>Pilih model AI dan mulai percakapan baru!</p>
                </div>
                <!-- Chat messages will appear here -->
            </div>

            <!-- Input Area -->
            <div class="chat-input-wrapper">
                <form id="chat-form">
                    <div class="input-container">
                        <button type="submit" class="send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                        <textarea id="message-input" placeholder="Ketik pesan Anda di sini..."></textarea>
                    </div>
                </form>
            </div>
            
            <div class="footer">
                <p><strong>by Saputra Budi</strong> &copy; 2025</p>
            </div>
        </div>
    </div>

    <!-- Loading Overlay for Long Responses -->
    <div class="loading-overlay" id="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">Memproses permintaan... Mohon tunggu...</div>
    </div>

    <script src="assets/js/script.js"></script>
</body>
</html> 