# 🤖 ChatOllama

Aplikasi web chat untuk Ollama model AI menggunakan PHP. Ini adalah aplikasi ringan yang memungkinkan Anda berinteraksi dengan model AI Ollama langsung dari browser.

## ✨ Fitur

- 🎨 UI yang menarik dengan SweetAlert
- ⚙️ Set IP server Ollama (default: localhost:11434)
- 🤖 Pilih model AI dari daftar model yang tersedia di server Ollama
- 💻 Kode bash dalam chatbox dengan tombol copy

## 📋 Persyaratan

- Server web dengan PHP (minimal versi 7.2)
- Server Ollama yang berjalan (default di localhost:11434)
- Model AI yang sudah diinstal di server Ollama

## 🔧 Cara Instalasi XAMPP di Windows

XAMPP diperlukan sebagai server web dengan PHP untuk menjalankan aplikasi ini:

1. Download XAMPP dari [situs resmi Apache Friends](https://www.apachefriends.org/download.html)
2. Pilih versi XAMPP yang sesuai dengan sistem operasi Windows Anda
3. Jalankan installer dan ikuti petunjuk instalasi
4. Pada panel kontrol XAMPP, aktifkan modul Apache
5. Folder root server web berada di `C:\xampp\htdocs\`

## 🚀 Cara Penggunaan

1. Clone atau download repositori ini ke direktori web server Anda
   ```bash
   git clone https://github.com/saputrabudi/chatollama.git
   ```
2. Buka aplikasi melalui browser (misalnya: http://localhost/chatollama/)
3. Atur alamat server Ollama jika berbeda dari default
4. Pilih model AI dari dropdown
5. Mulai chat baru dan kirim pesan

## 🐪 Cara Instalasi Ollama

### Windows

1. Download Ollama dari [ollama.com](https://ollama.com)
2. Instal dan jalankan Ollama
3. Buka command prompt dan jalankan `ollama run saputrabudi/exabot-matriks` (atau model lain yang ingin Anda gunakan)

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run saputrabudi/exabot-matriks
```

### macOS

1. Download Ollama dari [ollama.com](https://ollama.com)
2. Instal dan jalankan Ollama
3. Buka terminal dan jalankan `ollama run saputrabudi/exabot-matriks` (atau model lain yang ingin Anda gunakan)

## 🔥 Menggunakan Model saputrabudi/exabot-matriks

Untuk menggunakan model saputrabudi/exabot-matriks, ikuti langkah-langkah berikut:

1. Pastikan Ollama sudah terinstal dan berjalan
2. Jalankan perintah berikut untuk mendownload dan menggunakan model:

```bash
ollama pull saputrabudi/exabot-matriks
ollama run saputrabudi/exabot-matriks
```

3. Setelah model berjalan, buka aplikasi ChatOllama dan pilih "saputrabudi/exabot-matriks" dari daftar model yang tersedia

## 🛠️ Layanan Model AI Kustom

Jika Anda membutuhkan **Model AI Kustom** yang disesuaikan dengan kebutuhan bisnis Anda, kami menyediakan layanan pembuatan model khusus untuk berbagai keperluan:

### 🎯 Spesialisasi Model AI:
- 🎧 **Customer Service AI** - Chatbot otomatis untuk layanan pelanggan
- 📊 **Data Analytics AI** - Analisis data dan insights bisnis
- 💻 **Coding Assistant AI** - Bantuan programming dan development
- 📡 **System Monitoring AI** - Monitoring server dan infrastruktur
- 🎨 **Content Creation AI** - Pembuatan konten dan copywriting
- 📝 **Document Processing AI** - Pemrosesan dan analisis dokumen
- 🔍 **Research Assistant AI** - Bantuan riset dan analisis
- 🏢 **Enterprise Solutions** - Solusi AI untuk kebutuhan perusahaan

*Dan masih banyak lagi sesuai kebutuhan spesifik Anda!*

## ❓ Troubleshooting

- Pastikan server Ollama berjalan sebelum menggunakan aplikasi ini
- Jika tidak bisa terhubung ke server, periksa alamat server dan pastikan tidak ada firewall yang memblokir
- Untuk masalah izin file, pastikan PHP memiliki akses untuk menulis ke config.json
- Jika model saputrabudi/exabot-matriks tidak muncul di daftar, pastikan model sudah berhasil di-pull dan Ollama berjalan dengan benar

## 📱 Kontak

Untuk konsultasi dan pembuatan **Model AI Kustom**, hubungi:

**Saputra Budi**  
📱 WhatsApp: [08114540900](https://wa.me/6208114540900)  
📧 Email: [aptel.idn@gmail.com](mailto:aptel.idn@gmail.com)

---

## 🌟 GitHub Repository

Repositori ini tersedia di GitHub: [github.com/saputrabudi/chatollama](https://github.com/saputrabudi/chatollama)

---

### 👨‍💻 Developed by Saputra Budi 

![chatollama-a](https://github.com/user-attachments/assets/aa2dead1-cf5a-481f-9479-09615baa5af6)

![chatollama-b](https://github.com/user-attachments/assets/01a22f65-3c00-4f37-b641-bc51416f18bf)

