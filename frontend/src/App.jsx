import { useState, useEffect } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Breve retardo para suavizar la animación visual de la ruedita de carga
      const [response] = await Promise.all([
        fetch(`http://localhost:5000/api/search?search=${encodeURIComponent(query)}`),
        new Promise((resolve) => setTimeout(resolve, 500))
      ]);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError('Error de conexión con el servidor bancario.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1120', color: '#f8fafc', fontFamily: 'Inter, sans-serif', padding: '50px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Corporativo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px', color: '#f8fafc', margin: 0 }}>
              MERIDIAN FINANCIAL GROUP
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Portal Corporativo de Desembolsos y Créditos
          </p>
        </div>

        {/* Buscador: Input con spinner en el botón */}
        <div style={{ background: '#111c33', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar desembolso por cliente..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #283548',
                background: '#070c18',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#0369a1' : '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '105px',
                transition: 'background 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Buscando...</span>
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </form>
        </div>

        {/* Error de base de datos */}
        {error && (
          <div style={{ background: '#3b1219', border: '1px solid #f43f5e', padding: '14px 18px', borderRadius: '8px', color: '#fca5a5', marginBottom: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
            <b>[!] Database Error:</b> {error}
          </div>
        )}

        {/* Resultados con ruedita de carga (Spinner) central */}
        <div style={{ background: '#111c33', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '16px', color: '#cbd5e1' }}>
            Resultados de la Búsqueda:
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner"></div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '14px' }}>
                Consultando registros...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: '#070c18',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    borderLeft: '4px solid #0284c7'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9', marginBottom: '4px' }}>
                    [{item.id !== null ? item.id : 'N/A'}] {item.name}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                    Categoría: <span style={{ color: '#38bdf8' }}>{item.category}</span>
                    {item.amount !== null && item.amount !== undefined && (
                      <> | Monto: <span style={{ color: '#10b981' }}>${Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>
              No se encontraron registros activos.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;