import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const CATEGORIES = [
  { key: 'top', label: 'Oberteile' },
  { key: 'bottom', label: 'Unterteile' },
  { key: 'dress', label: 'Kleider' },
  { key: 'outerwear', label: 'Jacken & Mäntel' },
  { key: 'shoes', label: 'Schuhe' },
  { key: 'accessory', label: 'Accessoires' },
  { key: 'other', label: 'Sonstiges' },
];

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
  layout: {
    display: 'flex',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    gap: '24px',
  },
  leftPanel: {
    flex: 1,
    minWidth: 0,
  },
  rightPanel: {
    width: '360px',
    flexShrink: 0,
    position: 'sticky',
    top: '24px',
    alignSelf: 'flex-start',
  },
  panel: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '1px solid #3A2F2C',
    padding: '24px',
  },
  accordionItem: {
    borderBottom: '1px solid #3A2F2C',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  accordionTitle: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '22px',
    fontWeight: 600,
    margin: 0,
    color: '#F5EFE6',
  },
  accordionCount: {
    fontSize: '13px',
    color: '#9A8F86',
    background: 'transparent',
    border: '1px solid #3A2F2C',
    borderRadius: '999px',
    padding: '2px 10px',
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
    paddingBottom: '16px',
  },
  itemCard: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '1px solid #3A2F2C',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemCardSelected: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '2px solid #C9A65A',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemImage: {
    width: '100%',
    aspectRatio: '4/5',
    objectFit: 'cover',
    display: 'block',
    borderBottom: '1px solid rgba(201,166,90,0.3)',
  },
  itemImagePlaceholder: {
    width: '100%',
    aspectRatio: '4/5',
    backgroundColor: '#3A2F2C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9A8F86',
    fontSize: '13px',
    borderBottom: '1px solid rgba(201,166,90,0.3)',
  },
  itemInfo: {
    padding: '12px',
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#F5EFE6',
    margin: '0 0 4px',
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  },
  itemColor: {
    fontSize: '13px',
    color: '#9A8F86',
    margin: 0,
  },
  checkOverlay: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#C9A65A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0E0B0C',
    fontWeight: 700,
    fontSize: '14px',
  },
  itemCardWrapper: {
    position: 'relative',
  },
  previewStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  previewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    backgroundColor: '#0E0B0C',
    borderRadius: '8px',
  },
  previewThumb: {
    width: '48px',
    height: '60px',
    borderRadius: '4px',
    objectFit: 'cover',
    backgroundColor: '#3A2F2C',
    flexShrink: 0,
  },
  previewInfo: {
    flex: 1,
    minWidth: 0,
  },
  previewName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#F5EFE6',
    margin: 0,
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  },
  previewCategory: {
    fontSize: '13px',
    color: '#9A8F86',
    margin: '2px 0 0',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#8E1B22',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    backgroundColor: '#171214',
    border: '1px solid #3A2F2C',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#F5EFE6',
    fontSize: '16px',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '44px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '13px',
    color: '#9A8F86',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
    display: 'block',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: '#C9A65A',
    color: '#0E0B0C',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '44px',
    cursor: 'pointer',
    marginTop: '24px',
    transition: 'all 0.2s',
  },
  saveBtnDisabled: {
    width: '100%',
    backgroundColor: '#C9A65A',
    color: '#0E0B0C',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '44px',
    cursor: 'not-allowed',
    marginTop: '24px',
    opacity: 0.5,
    transition: 'all 0.2s',
  },
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#9A8F86',
  },
  emptyTitle: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '22px',
    fontWeight: 600,
    color: '#9A8F86',
    marginBottom: '8px',
  },
  error: {
    backgroundColor: '#8E1B22',
    color: '#F5EFE6',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  success: {
    backgroundColor: '#1B6B3A',
    color: '#F5EFE6',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '24px',
    flexWrap: 'wrap',
    paddingBottom: '48px',
  },
  link: {
    color: '#9A8F86',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #3A2F2C',
    transition: 'all 0.2s',
  },
};

function OutfitCreator() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedCats, setExpandedCats] = useState(
    () => CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: true }), {}),
  );

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const data = await api.get('/clothing');
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(key) {
    setExpandedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleItem(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function removeItem(id) {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }

  async function saveOutfit() {
    if (!outfitName.trim() || selectedIds.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await api.post('/outfits', {
        name: outfitName.trim(),
        clothing_item_ids: selectedIds,
      });
      setSuccess(`Outfit „${data.name}“ gespeichert!`);
      setOutfitName('');
      setSelectedIds([]);
    } catch (err) {
      setError(err.data?.detail || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  }

  const selectedItems = items.filter((i) => selectedIds.includes(i.id));
  const groupedItems = {};
  for (const cat of CATEGORIES) {
    const catItems = items.filter((i) => i.category === cat.key);
    if (catItems.length > 0) groupedItems[cat.key] = catItems;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Glamour Closet</h1>
        <p style={styles.subtitle}>Outfit-Creator</p>
        <div style={styles.redCarpet} />
      </div>

      {error && <div style={{ ...styles.error, maxWidth: '1200px', margin: '24px auto 0' }}>{error}</div>}
      {success && <div style={{ ...styles.success, maxWidth: '1200px', margin: '24px auto 0' }}>{success}</div>}

      <div style={styles.layout}>
        <div style={styles.leftPanel}>
          {loading ? (
            <div style={styles.empty}>
              <p style={{ color: '#9A8F86' }}>Lade Kleidungsstücke...</p>
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyTitle}>Deine Garderobe ist noch leer</div>
              <p style={{ color: '#9A8F86', marginBottom: '16px' }}>
                Füge zuerst Kleidungsstücke in der Garderobe hinzu.
              </p>
              <a href="/wardrobe" style={styles.link}>Zur Garderobe</a>
            </div>
          ) : (
            CATEGORIES.map((cat) => {
              const catItems = groupedItems[cat.key];
              if (!catItems) return null;
              return (
                <div key={cat.key} style={styles.accordionItem}>
                  <div style={styles.accordionHeader} onClick={() => toggleCategory(cat.key)}>
                    <h3 style={styles.accordionTitle}>{cat.label}</h3>
                    <span style={styles.accordionCount}>
                      {expandedCats[cat.key] ? '▼' : '▶'} {catItems.length}
                    </span>
                  </div>
                  {expandedCats[cat.key] && (
                    <div style={styles.itemGrid}>
                      {catItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <div key={item.id} style={styles.itemCardWrapper}>
                            <div
                              style={isSelected ? styles.itemCardSelected : styles.itemCard}
                              onClick={() => toggleItem(item.id)}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#C9A65A';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#3A2F2C';
                                }
                              }}
                            >
                              {item.image_filename ? (
                                <img
                                  src={`${API_BASE}/api/images/${item.image_filename}`}
                                  alt={item.name}
                                  style={styles.itemImage}
                                />
                              ) : (
                                <div style={styles.itemImagePlaceholder}>Kein Bild</div>
                              )}
                              <div style={styles.itemInfo}>
                                <p style={styles.itemName}>{item.name}</p>
                                {item.color && <p style={styles.itemColor}>{item.color}</p>}
                              </div>
                            </div>
                            {isSelected && (
                              <div style={styles.checkOverlay}>✓</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.panel}>
            <label style={styles.label}>Outfit-Name</label>
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="z. B. Abendgarderobe"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#C9A65A';
                e.target.style.boxShadow = '0 0 0 3px rgba(201,166,90,0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#3A2F2C';
                e.target.style.boxShadow = 'none';
              }}
            />

            <div style={{ marginTop: '24px' }}>
              <label style={styles.label}>Ausgewählte Teile ({selectedItems.length})</label>
              {selectedItems.length === 0 ? (
                <p style={{ color: '#9A8F86', fontSize: '14px' }}>
                  Wähle links Kleidungsstücke aus
                </p>
              ) : (
                <div style={styles.previewStack}>
                  {selectedItems.map((item) => (
                    <div key={item.id} style={styles.previewItem}>
                      {item.image_filename ? (
                        <img
                          src={`${API_BASE}/api/images/${item.image_filename}`}
                          alt={item.name}
                          style={styles.previewThumb}
                        />
                      ) : (
                        <div style={{ ...styles.previewThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A8F86', fontSize: '10px' }}>
                          kein Bild
                        </div>
                      )}
                      <div style={styles.previewInfo}>
                        <p style={styles.previewName}>{item.name}</p>
                        <p style={styles.previewCategory}>{item.category}</p>
                      </div>
                      <button
                        style={styles.removeBtn}
                        onClick={() => removeItem(item.id)}
                        title="Entfernen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              style={outfitName.trim() && selectedItems.length > 0 ? styles.saveBtn : styles.saveBtnDisabled}
              onClick={saveOutfit}
              disabled={saving || !outfitName.trim() || selectedItems.length === 0}
              onMouseEnter={(e) => {
                if (outfitName.trim() && selectedItems.length > 0) {
                  e.currentTarget.style.backgroundColor = '#DBBB72';
                }
              }}
              onMouseLeave={(e) => {
                if (outfitName.trim() && selectedItems.length > 0) {
                  e.currentTarget.style.backgroundColor = '#C9A65A';
                }
              }}
            >
              {saving ? 'Speichert...' : 'Outfit speichern'}
            </button>
          </div>
        </div>
      </div>

      <div style={styles.nav}>
        <a href="/" style={styles.link}>Startseite</a>
        <a href="/wardrobe" style={styles.link}>Garderobe</a>
        <a href="/outfits" style={styles.link}>Outfits</a>
      </div>
    </div>
  );
}

export default OutfitCreator;
