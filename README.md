# 📸 Galeria de Imagens - Documentação Rápida

## 🎯 Funcionalidades e Localização no Código

### 1. **Botão de Upload**
📁 `frontend/src/App.jsx` - Linhas 126-137
```jsx
<label htmlFor="file-input" style={styles.uploadButton}>
  ➕ Adicionar Imagem
</label>
<input
  id="file-input"
  type="file"
  accept="image/*"
  onChange={handleFileSelect}
  style={{ display: 'none' }}
/>
```

---

### 2. **Função de Upload de Imagem**
📁 `frontend/src/App.jsx` - Linhas 28-77
```jsx
const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  
  // Validações
  if (!file.type.startsWith('image/')) { ... }
  if (file.size > maxSize) { ... }
  
  // Preview local
  const reader = new FileReader();
  reader.onload = (e) => { ... };
  
  // Upload para servidor
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
};
```

---

### 3. **Criar Banco de Dados**
📁 `server.js` - Linhas 17-23
```javascript
const db = new sqlite3.Database('./galeria.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err);
  } else {
    console.log('✅ Conectado ao banco SQLite!');
  }
});
```

📁 `server.js` - Linhas 26-39
```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { ... });
```

---

### 4. **Endpoint: Salvar Imagem no Banco**
📁 `server.js` - Linhas 66-91
```javascript
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada!' });
  }

  const { filename, originalname } = req.file;

  // Salva no banco
  db.run(
    'INSERT INTO images (filename, original_name) VALUES (?, ?)',
    [filename, originalname],
    function(err) {
      res.json({
        message: 'Upload realizado com sucesso!',
        id: this.lastID,
        filename: filename,
        original_name: originalname
      });
    }
  );
});
```

---

### 5. **Visualizar Banco com Imagens**
📁 `frontend/src/Database.jsx` - Linhas 48-90
```jsx
<table style={styles.table}>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nome do Arquivo</th>
      <th>Nome Original</th>
      <th>Data</th>
      <th>Preview</th>
    </tr>
  </thead>
  <tbody>
    {images.map((img) => (
      <tr key={img.id}>
        <td>#{img.id}</td>
        <td><code>{img.filename}</code></td>
        <td>{img.original_name}</td>
        <td>{new Date(img.created_at).toLocaleString('pt-BR')}</td>
        <td>
          <img src={`/images/${img.filename}`} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 6. **Endpoint: Mostrar Imagens do Banco**
📁 `server.js` - Linhas 94-106
```javascript
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
```

---

### 7. **Acessar Endpoint e Mostrar na Página**
📁 `frontend/src/App.jsx` - Linhas 9-12
```jsx
useEffect(() => {
  loadImages();
}, []);
```

📁 `frontend/src/App.jsx` - Linhas 15-25
```jsx
const loadImages = async () => {
  try {
    const response = await fetch('/images');
    const data = await response.json();
    setImages(data.map(img => ({
      ...img,
      url: `/images/${img.filename}`
    })));
  } catch (error) {
    console.error('Erro ao carregar imagens:', error);
  }
};
```

📁 `frontend/src/App.jsx` - Linhas 153-170
```jsx
{images.map((image) => (
  <div key={image.id} style={styles.imageCard}>
    <img
      src={image.url}
      alt={image.filename}
      style={styles.image}
    />
    {/* ... */}
  </div>
))}
```

---

### 8. **Botão X para Deletar Imagem**
📁 `frontend/src/App.jsx` - Linhas 159-166
```jsx
<button
  style={styles.deleteButton}
  onClick={() => handleDelete(image.id, image.filename)}
  title="Deletar imagem"
>
  ✕
</button>
```

📁 `frontend/src/App.jsx` - Linhas 80-97
```jsx
const handleDelete = async (imageId, filename) => {
  if (!confirm(`🗑️ Deseja realmente deletar "${filename}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/images/${imageId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Erro ao deletar');

    setImages(images.filter(img => img.id !== imageId));
    
  } catch (error) {
    console.error('Erro:', error);
    alert('❌ Erro ao deletar imagem');
  }
};
```

---

### 9. **Endpoint: Deletar Imagem do Banco**
📁 `server.js` - Linhas 109-140
```javascript
app.delete('/images/:id', (req, res) => {
  const { id } = req.params;

  // Busca o arquivo para deletar
  db.get('SELECT filename FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar imagem' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Deleta arquivo físico
    const filePath = path.join(uploadsDir, row.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error('⚠️ Erro ao deletar arquivo:', err);
    });

    // Deleta do banco
    db.run('DELETE FROM images WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao deletar' });
      }

      console.log(`🗑️ Imagem ${id} deletada!`);
      res.json({ message: 'Imagem deletada com sucesso!' });
    });
  });
});
```

---

## 📊 Resumo dos Arquivos

| Funcionalidade | Arquivo | Linhas |
|---|---|---|
| 1. Botão Upload | `App.jsx` | 126-137 |
| 2. Função Upload | `App.jsx` | 28-77 |
| 3. Criar Banco | `server.js` | 17-39 |
| 4. Endpoint Salvar | `server.js` | 66-91 |
| 5. Visualizar Banco | `Database.jsx` | 48-90 |
| 6. Endpoint Listar | `server.js` | 94-106 |
| 7. Mostrar na Página | `App.jsx` | 9-25, 153-170 |
| 8. Botão Deletar | `App.jsx` | 80-97, 159-166 |
| 9. Endpoint Deletar | `server.js` | 109-140 |

