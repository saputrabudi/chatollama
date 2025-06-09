// DOM Elements
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const chatForm = document.getElementById('chat-form');
const modelSelect = document.getElementById('model-select');
const serverInput = document.getElementById('server-input');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistory = document.getElementById('chat-history');
const welcomeMessage = document.getElementById('welcome-message');
const loadingOverlay = document.getElementById('loading-overlay');

// Variables
let currentChatId = null;
let currentModel = '';
let chats = {};
let isWaitingForResponse = false;
let lastRefreshedServer = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    setupEventListeners();
});

// Load config from JSON file
function loadConfig() {
    fetch('config.php?action=load')
        .then(response => response.json())
        .then(data => {
            if (data && data.server) {
                serverInput.value = data.server;
            } else {
                serverInput.value = 'http://localhost:11434';
            }
            
            if (data && data.chats) {
                chats = data.chats;
                renderChatHistory();
            }
            
            refreshModels();
        })
        .catch(error => {
            console.error('Error loading config:', error);
            showAlert('Error loading configuration', 'error');
        });
}

// Save config to JSON file
function saveConfig() {
    const config = {
        server: serverInput.value,
        chats: chats
    };
    
    console.log('Saving config:', config);
    
    fetch('config.php?action=save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Error saving config:', data.message);
            showAlert('Error menyimpan konfigurasi', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving config:', error);
        showAlert('Error menyimpan konfigurasi', 'error');
    });
}

// Setup event listeners
function setupEventListeners() {
    // Chat form submission
    chatForm.addEventListener('submit', sendMessage);
    
    // Enter key to send message
    messageInput.addEventListener('keydown', function(e) {
        // Kirim pesan jika Enter ditekan tanpa tombol Shift
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    });
    
    // New chat
    newChatBtn.addEventListener('click', createNewChat);
    
    // Server input change
    serverInput.addEventListener('change', () => {
        saveConfig();
        refreshModels();
    });
    
    // Auto refresh when clicking on server input field
    serverInput.addEventListener('focus', () => {
        // Only refresh if the server address has changed since last refresh
        const currentServer = serverInput.value.trim();
        if (currentServer && currentServer !== lastRefreshedServer) {
            refreshModels();
        }
    });
    
    // Model selection
    modelSelect.addEventListener('click', () => {
        // Refresh models when user clicks on the dropdown
        const currentServer = serverInput.value.trim();
        if (currentServer && currentServer !== lastRefreshedServer) {
            refreshModels();
        }
    });
    
    modelSelect.addEventListener('change', () => {
        currentModel = modelSelect.value;
    });
}

// Refresh models from Ollama server
function refreshModels() {
    const server = serverInput.value.trim();
    if (!server) {
        showAlert('Silakan masukkan alamat server Ollama', 'warning');
        return;
    }
    
    // Skip if already refreshed for this server
    if (server === lastRefreshedServer) {
        return;
    }
    
    // Remember this server for tracking refreshes
    lastRefreshedServer = server;
    
    // Clear current options
    modelSelect.innerHTML = '<option value="">Pilih Model</option>';
    
    // Add loading option
    const loadingOption = document.createElement('option');
    loadingOption.value = "";
    loadingOption.textContent = "Memuat model...";
    loadingOption.disabled = true;
    modelSelect.appendChild(loadingOption);
    modelSelect.value = "";
    
    // Setup fetch dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 detik timeout
    
    fetch(`proxy.php?action=models&server=${encodeURIComponent(server)}`, {
        signal: controller.signal
    })
        .then(response => response.json())
        .then(data => {
            clearTimeout(timeoutId);
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Clear all options including loading
            modelSelect.innerHTML = '<option value="">Pilih Model</option>';
            
            if (data.models && data.models.length > 0) {
                data.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.name;
                    option.textContent = `${model.name} (${formatSize(model.size)})`;
                    modelSelect.appendChild(option);
                });
                
                showAlert('Model berhasil dimuat', 'success');
            } else {
                showAlert('Tidak ada model yang tersedia', 'info');
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Error refreshing models:', error);
            
            // Clear loading option
            modelSelect.innerHTML = '<option value="">Pilih Model</option>';
            
            if (error.name === 'AbortError') {
                showAlert('Permintaan timeout, server terlalu lama merespon', 'error');
            } else {
                showAlert(`Error: ${error.message}`, 'error');
            }
        });
}

// Format size in bytes to human-readable format
function formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Create a new chat
function createNewChat() {
    const id = Date.now().toString();
    const timestamp = new Date().toLocaleString();
    
    chats[id] = {
        id: id,
        title: 'Chat Baru',
        timestamp: timestamp,
        messages: []
    };
    
    saveConfig();
    renderChatHistory();
    switchToChat(id);
}

// Render chat history in sidebar
function renderChatHistory() {
    chatHistory.innerHTML = '';
    
    // Add clear all chats button at the top
    if (Object.keys(chats).length > 0) {
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'clear-all-chats-btn';
        clearAllBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus Semua Riwayat';
        clearAllBtn.addEventListener('click', clearAllChats);
        chatHistory.appendChild(clearAllBtn);
    }
    
    if (Object.keys(chats).length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-history';
        emptyMsg.textContent = 'Belum ada riwayat chat';
        chatHistory.appendChild(emptyMsg);
        return;
    }
    
    // Sort chats by timestamp (newest first)
    const sortedChats = Object.values(chats).sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    sortedChats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        const title = document.createElement('div');
        title.className = 'chat-item-title';
        title.textContent = chat.title;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        };
        
        chatItem.appendChild(title);
        chatItem.appendChild(deleteBtn);
        
        chatItem.addEventListener('click', () => {
            switchToChat(chat.id);
        });
        
        chatHistory.appendChild(chatItem);
    });
}

// Switch to a specific chat
function switchToChat(chatId) {
    currentChatId = chatId;
    renderChatHistory();
    
    if (chatId && chats[chatId]) {
        welcomeMessage.style.display = 'none';
        chatContainer.style.display = 'flex';
        
        // Render messages
        renderChat(chats[chatId]);
    } else {
        welcomeMessage.style.display = 'flex';
        chatContainer.style.display = 'none';
    }
}

// Delete a chat
function deleteChat(chatId) {
    Swal.fire({
        title: 'Hapus Chat?',
        text: 'Anda yakin ingin menghapus chat ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            delete chats[chatId];
            saveConfig();
            
            if (currentChatId === chatId) {
                currentChatId = null;
                welcomeMessage.style.display = 'flex';
                chatContainer.style.display = 'none';
            }
            
            renderChatHistory();
            
            Swal.fire(
                'Terhapus!',
                'Chat telah dihapus.',
                'success'
            );
        }
    });
}

// Render a chat and its messages
function renderChat(chat) {
    chatContainer.innerHTML = '';
    
    if (!chat.messages || chat.messages.length === 0) {
        return;
    }
    
    chat.messages.forEach(message => {
        appendMessage(message);
    });
    
    // Scroll to bottom
    scrollToBottom();
}

// Send message
function sendMessage(event) {
    event.preventDefault();
    
    const messageText = messageInput.value.trim();
    if (!messageText) {
        showAlert('Silakan masukkan pesan', 'warning');
        return;
    }
    
    if (!currentModel) {
        showAlert('Silakan pilih model AI terlebih dahulu', 'warning');
        return;
    }
    
    if (isWaitingForResponse) {
        showAlert('Tunggu sampai respon selesai', 'info');
        return;
    }
    
    if (!currentChatId) {
        createNewChat();
    }
    
    isWaitingForResponse = true;
    
    // Create user message object
    const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString()
    };
    
    // Add message to UI
    appendMessage(userMessage);
    
    // Add to chat history
    addMessageToChat(userMessage);
    
    // Clear input
    messageInput.value = '';
    
    // Show thinking indicator
    showThinkingIndicator();
    
    // Prepare data for text-only request
    const requestData = {
        model: currentModel,
        server: serverInput.value,
        message: messageText
    };
    
    // Setup fetch dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 detik timeout
    
    // Send to server
    fetch('proxy.php?action=chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
    })
    .then(response => response.json())
    .then(handleResponse)
    .catch(error => {
        if (error.name === 'AbortError') {
            showAlert('Permintaan timeout, model AI terlalu lama merespon', 'error');
        } else {
            handleError(error);
        }
    })
    .finally(() => {
        clearTimeout(timeoutId);
        isWaitingForResponse = false;
        removeThinkingIndicator();
    });
    
    // Scroll to bottom
    scrollToBottom();
}

// Handle API response
function handleResponse(data) {
    if (data.error) {
        showAlert(`Error: ${data.error}`, 'error');
        return;
    }
    
    // Create bot message object
    const botMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
    };
    
    // Add message to UI
    appendMessage(botMessage);
    
    // Add to chat history
    addMessageToChat(botMessage);
    
    // Update chat title if it's still the default
    if (chats[currentChatId].title === 'Chat Baru' && chats[currentChatId].messages.length >= 2) {
        // Use first few words of first user message as title
        const firstUserMessage = chats[currentChatId].messages.find(m => m.role === 'user');
        if (firstUserMessage) {
            const words = firstUserMessage.content.split(' ').slice(0, 4).join(' ');
            chats[currentChatId].title = words + (words.length < firstUserMessage.content.length ? '...' : '');
            saveConfig();
            renderChatHistory();
        }
    }
    
    // Scroll to bottom
    scrollToBottom();
}

// Handle API error
function handleError(error) {
    console.error('Error:', error);
    showAlert('Terjadi kesalahan saat menghubungi server', 'error');
}

// Add message to chat history
function addMessageToChat(message) {
    if (!chats[currentChatId]) return;
    
    if (!chats[currentChatId].messages) {
        chats[currentChatId].messages = [];
    }
    
    chats[currentChatId].messages.push(message);
    chats[currentChatId].timestamp = new Date().toLocaleString();
    
    // Force save to config after each message
    saveConfig();
}

// Append message to chat UI
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role === 'user' ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process message content - handle code blocks and markdown
    if (message.role === 'assistant') {
        let content = message.content;
        
        // Process code blocks
        content = processCodeBlocks(content);
        
        // Process markdown (basic implementation)
        content = processMarkdown(content);
        
        messageContent.innerHTML = content;
        
        // Add copy button event listeners for code blocks
        setTimeout(() => {
            const codeBlocks = messageElement.querySelectorAll('.code-block');
            codeBlocks.forEach(block => {
                const copyBtn = block.querySelector('.copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        const code = block.querySelector('code').innerText;
                        navigator.clipboard.writeText(code).then(() => {
                            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                            setTimeout(() => {
                                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                            }, 2000);
                        });
                    });
                }
            });
        }, 0);
    } else {
        messageContent.textContent = message.content;
        
        // Add file attachment if present
        if (message.file) {
            const fileAttachment = document.createElement('div');
            fileAttachment.className = 'file-attachment';
            fileAttachment.innerHTML = `
                <i class="fas fa-paperclip"></i>
                <span>${message.file.name} (${formatSize(message.file.size)})</span>
            `;
            messageContent.appendChild(fileAttachment);
        }
    }
    
    messageElement.appendChild(messageContent);
    chatContainer.appendChild(messageElement);
}

// Process code blocks in message content
function processCodeBlocks(content) {
    // Replace bash code blocks
    content = content.replace(/```bash([\s\S]*?)```/g, (match, code) => {
        return `<div class="code-block bash-code">
                    <div class="code-header">
                        <span class="code-language">bash</span>
                        <button class="copy-btn" title="Copy to clipboard">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <pre><code>${escapeHTML(code.trim())}</code></pre>
                </div>`;
    });
    
    // Replace other code blocks with language detection
    content = content.replace(/```(\w*)([\s\S]*?)```/g, (match, language, code) => {
        const lang = language || 'code';
        return `<div class="code-block ${lang}-code">
                    <div class="code-header">
                        <span class="code-language">${lang}</span>
                        <button class="copy-btn" title="Copy to clipboard">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <pre><code>${escapeHTML(code.trim())}</code></pre>
                </div>`;
    });
    
    // Replace inline code
    content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    return content;
}

// Process basic markdown
function processMarkdown(content) {
    // Bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Headers
    content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

// Escape HTML entities
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show thinking indicator
function showThinkingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot-message thinking';
    indicator.innerHTML = '<div class="thinking-dots"><span>.</span><span>.</span><span>.</span></div>';
    indicator.id = 'thinking-indicator';
    chatContainer.appendChild(indicator);
    scrollToBottom();
    
    // Tampilkan loading overlay setelah 5 detik jika respons belum muncul
    setTimeout(() => {
        if (isWaitingForResponse) {
            showLoadingOverlay();
        }
    }, 5000);
}

// Remove thinking indicator
function removeThinkingIndicator() {
    const indicator = document.getElementById('thinking-indicator');
    if (indicator) {
        indicator.remove();
    }
    hideLoadingOverlay();
}

// Show loading overlay
function showLoadingOverlay() {
    loadingOverlay.classList.add('active');
}

// Hide loading overlay
function hideLoadingOverlay() {
    loadingOverlay.classList.remove('active');
}

// Scroll chat to bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show alert using SweetAlert2
function showAlert(message, type = 'info') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    
    Toast.fire({
        icon: type,
        title: message
    });
}

// Clear all chats
function clearAllChats() {
    Swal.fire({
        title: 'Hapus Semua Riwayat?',
        text: 'Anda yakin ingin menghapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus semua!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            chats = {};
            saveConfig();
            currentChatId = null;
            welcomeMessage.style.display = 'flex';
            chatContainer.style.display = 'none';
            renderChatHistory();
            
            Swal.fire(
                'Terhapus!',
                'Semua riwayat chat telah dihapus.',
                'success'
            );
        }
    });
} 