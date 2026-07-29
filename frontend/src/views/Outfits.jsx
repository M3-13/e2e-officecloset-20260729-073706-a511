import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0E0B0C',
    color: '#F5EFE6',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    padding: '48px 24px 24px',
    textAlign: 'center',
    borderBottom: '1px solid #3A2F2C',
  },
  title: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '44px',
    fontWeight: 600,
    color: '#C9A65A',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#9A8F86',
    marginTop: '8px',
  },
  redCarpet: {
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, #8E1B22, #C9A65A, #8E1B22, transparent)',
    marginTop: '24px',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '1px solid #3A2F2C',
    overflow: 'hidden',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardBody: {
    padding: '16px',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '22px',
    fontWeight: 600,
    color: '#F5EFE6',
    margin: '0 0 4px',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#9A8F86',
    margin: '0 0 12px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  btnPrimary: {
    backgroundColor: '#C9A65A',
    color: '#0E0B0C',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '44px',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s',
  },
  btnDanger: {
    backgroundColor: '#8E1B22',
    color: '#F5EFE6',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '44px',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s',
  },
  empty: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  emptyTitle: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 600,
    color: '#9A8F86',
    marginBottom: '8px',
  },
  emptyText: {
    color: '#9A8F86',
    marginBottom: '24px',
  },
  link: {
    color: '#9A8F86',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #3A2F2C',
    transition: 'all 0.2s',
    display: 'inline-block',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14,11,12,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  },
  modal: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '1px solid #3A2F2C',
    maxWidth: '520px',
    width: '100%',
    padding: '32px',
    position: 'relative',
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 600,
    color: '#F5EFE6',
    margin: '0 0 8px',
  },
  modalDivider: {
    height: '1px',
    backgroundColor: '#C9A65A',
    marginBottom: '24px',
    opacity: 0.3,
  },
  modalClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#9A8F86',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    lineHeight: 1,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  btnGhost: {
    background: 'transparent',
    border: '1px solid #3A2F2C',
    color: '#F5EFE6',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '44px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    backgroundColor: '#0E0B0C',
    borderRadius: '8px',
  },
  itemThumb: {
    width: '48px',
    height: '60px',
    borderRadius: '4px',
    objectFit: 'cover',
    backgroundColor: '#3A2F2C',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#F5EFE6',
    margin: 0,
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  },
  itemCategory: {
    fontSize: '13px',
    color: '#9A8F86',
    margin: '2px 0 0',
  },
  confirmIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#8E1B22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '24px',
    color: '#F5EFE6',
  },
  confirmText: {
    textAlign: 'center',
    color: '#9A8F86',
    marginBottom: '24px',
    fontSize: '15px',
    lineHeight: '1.5',
  },
  loading: {
    textAlign: 'center',
    padding: '64px',
    color: '#9A8F86',
  },
  noLink: {
    color: '#C9A65A',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #C9A65A',
    transition: 'all 0.2s',
    display: 'inline-block',
    marginTop: '8px',
  },
};

function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOutfit, setOpenOutfit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchOutfits = useCallback(async () => {
    try {
      const data = await api.get('/outfits');
      setOutfits(data);
    } catch {
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  async function handleDelete(id) {
    try {
      await api.delete(`/outfits/${id}`);
      setDeleteTarget(null);
      setOpenOutfit(null);
      fetchOutfits();
    } catch {
      // Silently fail
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const categoryLabel = (cat) => {
    const labels = {
      top: 'Oberteil',
      bottom: 'Unterteil',
      dress: 'Kleid',
      outerwear: 'Jacke/Mantel',
      shoes: 'Schuhe',
      accessory: 'Accessoire',
      other: 'Sonstiges',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Glamour Closet</h1>
          <p style={styles.subtitle}>Outfit-Übersicht</p>
          <div style={styles.redCarpet} />
        </div>
        <div style={styles.loading}>Lade Outfits...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Glamour Closet</h1>
        <p style={styles.subtitle}>Outfit-Übersicht</p>
        <div style={styles.redCarpet} />
      </div>

      <div style={styles.main}>
        {outfits.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyTitle}>Noch keine Outfits</div>
            <p style={styles.emptyText}>
              Erstelle dein erstes Outfit im Outfit-Creator.
            </p>
            <a href="/outfit-creator" style={styles.noLink}>
              Zum Outfit-Creator
            </a>
          </div>
        ) : (
          <div style={styles.grid}>
            {outfits.map((outfit) => (
              <div key={outfit.id} style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,166,90,0.6)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#3A2F2C';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {outfit.items && outfit.items.length > 0 && outfit.items[0].image_filename ? (
                  <img
                    src={`${API_BASE}/api/images/${outfit.items[0].image_filename}`}
                    alt=""
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', borderBottom: '1px solid rgba(201,166,90,0.3)' }}
                  />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: '#3A2F2C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A8F86', fontSize: '13px', borderBottom: '1px solid rgba(201,166,90,0.3)' }}>
                    {outfit.items && outfit.items.length > 0 ? 'Kein Bild' : 'Keine Teile'}
                  </div>
                )}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{outfit.name}</h3>
                  <p style={styles.cardMeta}>
                    {outfit.items ? outfit.items.length : 0} Teile · {formatDate(outfit.created_at)}
                  </p>
                  <div style={styles.cardActions}>
                    <button
                      style={styles.btnPrimary}
                      onClick={() => setOpenOutfit(outfit)}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DBBB72'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C9A65A'; }}
                    >
                      Öffnen
                    </button>
                    <button
                      style={styles.btnDanger}
                      onClick={() => setDeleteTarget(outfit)}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A82830'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8E1B22'; }}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '24px', flexWrap: 'wrap' }}>
        <a href="/" style={styles.link}>Startseite</a>
        <a href="/wardrobe" style={styles.link}>Garderobe</a>
        <a href="/outfit-creator" style={styles.link}>Outfit-Creator</a>
      </div>

      {openOutfit && (
        <div style={styles.overlay} onClick={() => setOpenOutfit(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.modalClose}
              onClick={() => setOpenOutfit(null)}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F5EFE6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9A8F86'; }}
            >
              ✕
            </button>
            <h2 style={styles.modalTitle}>{openOutfit.name}</h2>
            <div style={styles.modalDivider} />
            <p style={{ fontSize: '13px', color: '#9A8F86', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
              Enthaltene Kleidungsstücke ({openOutfit.items ? openOutfit.items.length : 0})
            </p>
            {openOutfit.items && openOutfit.items.length > 0 ? (
              <div style={styles.itemList}>
                {openOutfit.items.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    {item.image_filename ? (
                      <img
                        src={`${API_BASE}/api/images/${item.image_filename}`}
                        alt={item.name}
                        style={styles.itemThumb}
                      />
                    ) : (
                      <div style={{ ...styles.itemThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A8F86', fontSize: '10px' }}>
                        kein Bild
                      </div>
                    )}
                    <div style={styles.itemInfo}>
                      <p style={styles.itemName}>{item.name}</p>
                      <p style={styles.itemCategory}>{categoryLabel(item.category)}</p>
                    </div>
                    {item.color && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        border: '1px solid #3A2F2C',
                        flexShrink: 0,
                      }} title={item.color} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9A8F86', fontSize: '14px' }}>Dieses Outfit enthält keine Kleidungsstücke.</p>
            )}
            <div style={styles.modalActions}>
              <button
                style={styles.btnDanger}
                onClick={() => { setOpenOutfit(null); setDeleteTarget(openOutfit); }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A82830'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8E1B22'; }}
              >
                Löschen
              </button>
              <button
                style={styles.btnGhost}
                onClick={() => setOpenOutfit(null)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9A65A'; e.currentTarget.style.color = '#C9A65A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A2F2C'; e.currentTarget.style.color = '#F5EFE6'; }}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmIcon}>!</div>
            <h2 style={{ ...styles.modalTitle, textAlign: 'center' }}>Outfit löschen</h2>
            <div style={styles.modalDivider} />
            <p style={styles.confirmText}>
              Möchtest du <strong style={{ color: '#F5EFE6' }}>„{deleteTarget.name}“</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.btnGhost}
                onClick={() => setDeleteTarget(null)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9A65A'; e.currentTarget.style.color = '#C9A65A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A2F2C'; e.currentTarget.style.color = '#F5EFE6'; }}
              >
                Abbrechen
              </button>
              <button
                style={styles.btnDanger}
                onClick={() => handleDelete(deleteTarget.id)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A82830'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8E1B22'; }}
              >
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Outfits;
