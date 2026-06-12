import { useRef, useState, useEffect } from 'react';
import './ChordCell.css';

export default function ChordCell({ rowIndex, colIndex, chord, selected, trail, printWidth, screenWidth, onSelect, onContextMenu, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(chord || '');
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    onChange(draft.trim() || null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft('');
  };

  const handleClick = (e) => {
    onSelect(rowIndex, colIndex);
  };

  const handleDoubleClick = () => {
    startEdit();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onSelect(rowIndex, colIndex);
    onContextMenu(e, rowIndex, colIndex);
  };

  const handleKeyDown = (e) => {
    if (!selected) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // 編集中でなければコードを削除
      if (!editing) {
        onChange(null);
      }
    }
  };

  // セルにフォーカスがある状態で文字を打ち始めたら編集モードへ
  const handleKeyPress = (e) => {
    if (!editing && selected && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      setDraft(e.key);
      setEditing(true);
    }
  };

  return (
    <div
      className={`chord-cell${selected ? ' selected' : ''}${chord ? ' has-chord' : ''}${trail ? ' trail' : ''}`}
      style={{ '--print-width': printWidth, ...(screenWidth ? { width: screenWidth } : {}) }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      data-row={rowIndex}
      data-col={colIndex}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="chord-edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
            if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
            e.stopPropagation();
          }}
          onBlur={commitEdit}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        chord && <span className="chord-label">{chord}</span>
      )}
    </div>
  );
}
