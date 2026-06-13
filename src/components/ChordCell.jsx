import { useRef, useState, useEffect } from 'react';
import './ChordCell.css';

const LONG_PRESS_MS = 500;

export default function ChordCell({ rowIndex, colIndex, chord, selected, trail, space, printWidth, screenWidth, onSelect, onContextMenu, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

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
    if (longPressTriggered.current) return;
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

  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // 左ボタン or タッチのみ
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      onSelect(rowIndex, colIndex);
      onContextMenu(
        { clientX: e.clientX, clientY: e.clientY, preventDefault: () => {} },
        rowIndex,
        colIndex
      );
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
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
      className={`chord-cell${selected ? ' selected' : ''}${chord ? ' has-chord' : ''}${trail ? ' trail' : ''}${space ? ' space' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      style={{ '--print-width': printWidth, ...(screenWidth ? { width: screenWidth } : {}), touchAction: 'none' }}
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
