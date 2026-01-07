import { useState, useEffect } from 'react';

function App() {
  const [images, setImages] = useState([]);

  // Carrega imagens ao iniciar
  useEffect(() => {
    loadImages();
  }, []);

  //  carregar imagens do servidor
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

  //  upload de imagem
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Verifica se é imagem
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor, selecione apenas imagens!');
      return;
    }

    // Verifica o tamanho, máximo de 5mb
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ Imagem muito grande! Tamanho máximo: 5MB');
      return;
    }

    // Preview local 
    const reader = new FileReader();
    reader.onload = (e) => {
      const tempImage = {
        id: `temp-${Date.now()}`,
        filename: file.name,
        url: e.target.result,
        uploading: true
      };
      setImages(prev => [tempImage, ...prev]);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Erro no upload');

      const data = await response.json();
      
      // Substitui a imagem temporária pela real
      setImages(prev => prev.map(img => 
        img.filename === file.name && img.uploading
          ? { ...data, url: `/images/${data.filename}` }
          : img
      ));

    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao fazer upload da imagem');
      setImages(prev => prev.filter(img => !(img.filename === file.name && img.uploading)));
    }
    
    e.target.value = '';
  };

  //  deletar imagem
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

  return (
    <body style={styles.body}>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1 style={styles.h1}>📸 Minha Galeria de Imagens</h1>
          <p style={styles.subtitle}>
            {images.length} {images.length === 1 ? 'imagem' : 'imagens'} na galeria
          </p>
        </header>

       
        <div style={styles.uploadSection}>
          <label 
            htmlFor="file-input" 
            style={styles.uploadButton}
          >
            ➕ Adicionar Imagem
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <a 
            href="/database"
            style={styles.databaseButton}
          >
            🗄️ Ver Banco de Dados
          </a>
        </div>

        {/* parte da galeria */}
        <div style={styles.gallery}>
          {images.length === 0 ? (
            <p style={styles.emptyMessage}>
              Nenhuma imagem ainda. Adicione sua primeira foto! 📷
            </p>
          ) : (
            images.map((image) => (
              <div key={image.id} style={styles.imageCard}>
                <img
                  src={image.url}
                  alt={image.filename}
                  style={styles.image}
                />
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(image.id, image.filename)}
                  title="Deletar imagem"
                >
                  ✕
                </button>
                <div style={styles.imageInfo}>
                  <p style={styles.imageName}>{image.filename}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </body>
  );
}

// Meus Styles
const styles = {
  body: {
    margin: '0px auto', 
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgb(35, 49, 66) 0%, rgb(249, 89, 89) 100%)',
  },
  app: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#e3e3e3',
  },
  h1: {
    fontSize: '2.5rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    margin: 0,
  },
  subtitle: {
    color: '#e3e3e3',
    marginTop: '10px',
    fontSize: '1.1rem',
  },
  uploadSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '40px',
  },
  uploadButton: {
    background: '#455d7a',
    color: '#f95959',
    padding: '15px 40px',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    display: 'inline-block',
  },
  databaseButton: {
    background: '#f95959',
    color: 'white',
    padding: '15px 40px',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    display: 'inline-block',
    textDecoration: 'none',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    minHeight: '200px',
  },
  emptyMessage: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#e3e3e3',
    fontSize: '1.2rem',
    padding: '60px 20px',
    opacity: 0.7,
  },
  imageCard: {
    position: 'relative',
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    display: 'block',
  },
  deleteButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(249, 89, 89, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    opacity: 0.8,
  },
  imageInfo: {
    padding: '15px',
    background: '#f8f9fa',
  },
  imageName: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#455d7a',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default App;