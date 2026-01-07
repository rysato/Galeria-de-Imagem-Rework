// server.js - Cole este arquivo na RAIZ do projeto (galeria-imagens/server.js)

const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 🗂️ PASSO 1: Criar pasta para uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Pasta uploads criada!');
}

// 🗄️ PASSO 2: Criar/conectar banco de dados SQLite
const db = new sqlite3.Database('./galeria.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err);
  } else {
    console.log('✅ Conectado ao banco SQLite!');
  }
});

// 📦 PASSO 3: Criar tabela de imagens
db.run(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Erro ao criar tabela:', err);
  } else {
    console.log('✅ Tabela images pronta!');
  }
});

// ⚙️ PASSO 4: Configurar Multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

// 🌐 Middleware
app.use(express.json());
app.use('/images', express.static(uploadsDir));

// 📤 ENDPOINT: Upload de imagem
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada!' });
  }

  const { filename, originalname } = req.file;

  db.run(
    'INSERT INTO images (filename, original_name) VALUES (?, ?)',
    [filename, originalname],
    function(err) {
      if (err) {
        console.error('❌ Erro ao salvar no banco:', err);
        return res.status(500).json({ error: 'Erro ao salvar no banco' });
      }

      console.log(`✅ Imagem salva: ${originalname} (ID: ${this.lastID})`);
      
      res.json({
        message: 'Upload realizado com sucesso!',
        id: this.lastID,
        filename: filename,
        original_name: originalname
      });
    }
  );
});

// 📋 ENDPOINT: Listar todas as imagens
app.get('/images', (req, res) => {
  db.all('SELECT * FROM images ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar imagens:', err);
      return res.status(500).json({ error: 'Erro ao buscar imagens' });
    }

    console.log(`📸 ${rows.length} imagens encontradas`);
    res.json(rows);
  });
});

// 🗑️ ENDPOINT: Deletar imagem
app.delete('/images/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT filename FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('❌ Erro ao buscar imagem:', err);
      return res.status(500).json({ error: 'Erro ao buscar imagem' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    const filePath = path.join(uploadsDir, row.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error('⚠️ Erro ao deletar arquivo:', err);
    });

    db.run('DELETE FROM images WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('❌ Erro ao deletar do banco:', err);
        return res.status(500).json({ error: 'Erro ao deletar' });
      }

      console.log(`🗑️ Imagem ${id} deletada!`);
      res.json({ message: 'Imagem deletada com sucesso!' });
    });
  });
});

// 🔍 ENDPOINT: Ver o banco de dados
app.get('/debug/database', (req, res) => {
  db.all('SELECT * FROM images', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      total: rows.length,
      images: rows
    });
  });
});

// 🚀 Inicia o servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  🚀 Servidor rodando!              ║
║  📍 http://localhost:${PORT}       ║
║                                    ║
║  Endpoints disponíveis:            ║
║  POST   /upload                    ║
║  GET    /images                    ║
║  DELETE /images/:id                ║
║  GET    /debug/database            ║
╚════════════════════════════════════╝
  `);
});