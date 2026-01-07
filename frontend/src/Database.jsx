import { useState, useEffect } from 'react';

function Database() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const response = await fetch('/debug/database');
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error('Erro:', error);
      }
    };
    
    loadDatabase();
  }, []);

  const refreshDatabase = async () => {
    try {
      const response = await fetch('/debug/database');
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <body style={styles.body}>
      <div style={styles.container}> 
        <h1 style={styles.title}>🗄️ Banco de Dados</h1>
        <div style={styles.buttons}>
          <a href="/" style={styles.backButton}>← Voltar</a>
          
          <button onClick={refreshDatabase} style={styles.refreshButton}>
            🔄 Atualizar
          </button>
        </div>

        <div style={styles.info}>
          <strong>Total:</strong> {images.length} imagens
        </div>

        {images.length === 0 ? (
          <p style={styles.empty}>Nenhuma imagem no banco ainda.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nome do Arquivo</th>
                <th style={styles.th}>Nome Original</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Preview</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id} style={styles.tr}>
                  <td style={styles.td}>#{img.id}</td>
                  <td style={styles.td}>
                    <code style={styles.code}>{img.filename}</code>
                  </td>
                  <td style={styles.td}>{img.original_name}</td>
                  <td style={styles.td}>
                    {new Date(img.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td style={styles.td}>
                    <img 
                      src={`/images/${img.filename}`}
                      style={styles.preview}
                      alt={img.original_name}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </body>
  );
}

const styles = {
  body: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, rgb(35, 49, 66) 0%, rgb(249, 89, 89) 100%)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  title: {
    color: '#455d7a',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '2rem',
  },
  buttons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  backButton: {
    background: '#f95959',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  refreshButton: {
    background: '#455d7a',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '50px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  info: {
    textAlign: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '30px',
    fontSize: '1.1rem',
    color: '#455d7a',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '60px',
    fontSize: '1.2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    background: '#455d7a',
    color: 'white',
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  tr: {
    borderBottom: '1px solid #e0e0e0',
  },
  td: {
    padding: '15px',
    color: '#333',
  },
  code: {
    background: '#f4f4f4',
    padding: '5px 10px',
    borderRadius: '5px',
    color: '#f95959',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
  },
  preview: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
};

export default Database;