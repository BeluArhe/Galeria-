import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`http://localhost:5000/api/search?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError('Error de conexión con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <h1 style={{ color: '#38bdf8', textAlign: 'center', marginBottom: '10px' }}>🛡️ The Secret Vault - CTF</h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Buscador avanzado de productos (Vulnerable a SQLi)</p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Buscar producto o inyectar SQL (ej: ' UNION SELECT...)" 
            style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', outline: 'none' }}
          />
          <button 
            type="submit" 
            style={{ padding: '12px 24px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#7f1d1d', border: '1px solid #f87171', padding: '12px', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px', fontFamily: 'monospace' }}>
            <b>[!] Database Error:</b> {error}
          </div>
        )}

        <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '8px', marginBottom: '15px' }}>Resultados de la Búsqueda:</h3>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.length > 0 ? (
            results.map((item, index) => (
              <li key={index} style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #38bdf8' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>[{item.id}] {item.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>
                  Categoría: <span style={{ color: '#38bdf8' }}>{item.category}</span> | Precio: <span style={{ color: '#4ade80' }}>${item.price}</span>
                </div>
              </li>
            ))
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No se encontraron productos o no hay resultados activos.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;