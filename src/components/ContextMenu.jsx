import { useEffect, useRef, useState } from 'react';
import { getChordMenuData } from '../utils/musicTheory';
import './ContextMenu.css';

export default function ContextMenu({ position, keyRoot, keyType, onSelect, onClear, onClose }) {
  const menuRef = useRef(null);
  const [customChord, setCustomChord] = useState('');
  const isMinor = keyType === 'minor';
  const { diatonic, sevenths, others } = getChordMenuData(keyRoot, isMinor);

  useEffect(() => {
    if (!menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = position.x;
    let y = position.y;
    if (x + rect.width > vw) x = vw - rect.width - 8;
    if (y + rect.height > vh) y = vh - rect.height - 8;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }, [position]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleCustomSubmit = () => {
    if (customChord.trim()) {
      onSelect(customChord.trim());
      setCustomChord('');
    }
  };

  return (
    <>
      <div className="ctx-overlay" onClick={onClose} />
      <div className="ctx-menu" ref={menuRef} style={{ left: position.x, top: position.y }}>
        <Section title="ダイアトニック" chords={diatonic} onSelect={onSelect} />
        <Section title="セブンス" chords={sevenths} onSelect={onSelect} />
        <Section title="その他" chords={others} onSelect={onSelect} />

        <div className="ctx-section">
          <div className="ctx-section-title">カスタム入力</div>
          <div className="ctx-custom">
            <input
              type="text"
              value={customChord}
              onChange={(e) => setCustomChord(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
              placeholder="例: Caug, F#m7b5"
              autoFocus
            />
            <button onClick={handleCustomSubmit}>入力</button>
          </div>
        </div>

        <div className="ctx-divider" />
        <button className="ctx-clear-btn" onClick={onClear}>クリア</button>
      </div>
    </>
  );
}

function Section({ title, chords, onSelect }) {
  return (
    <div className="ctx-section">
      <div className="ctx-section-title">{title}</div>
      <div className="ctx-chord-group">
        {chords.map((chord) => (
          <button key={chord} className="ctx-chord-btn" onClick={() => onSelect(chord)}>
            {chord}
          </button>
        ))}
      </div>
    </div>
  );
}
