import { useState, useCallback } from 'react';
import ChordCell from './ChordCell';
import ContextMenu from './ContextMenu';
import './ScoreGrid.css';

const CHORD_ONLY_CELLS = 20;
const TRAILING_CELLS = 4;

const isLabelLine = (line) => /^\[.+\]$/.test(line.trim());

// 行をチャンクに分割
// 日本語文字 → 1文字=1チャンク(type:'ja')
// 英数字の連続 → 単語全体=1チャンク(type:'en')
// スペース → 1チャンク(type:'space')
function splitIntoChunks(line) {
  const chunks = [];
  const chars = [...line];
  let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    if (/[ \t　]/.test(c)) {
      chunks.push({ text: c, type: 'space' });
      i++;
    } else if (/[a-zA-Z0-9]/.test(c)) {
      let word = '';
      while (i < chars.length && /[a-zA-Z0-9''-]/.test(chars[i])) {
        word += chars[i];
        i++;
      }
      chunks.push({ text: word, type: 'en' });
    } else {
      chunks.push({ text: c, type: 'ja' });
      i++;
    }
  }
  return chunks;
}

// 印刷時セル幅を pt 単位で計算
function calcPrintWidth(chord, lyricsFontSize, chunk = { type: 'ja', text: '' }) {
  const { type, text } = chunk;

  if (type === 'trail') {
    if (!chord) return '0pt';
    return `${(Math.max(1.8, chord.length * 0.55 + 0.5) * lyricsFontSize).toFixed(1)}pt`;
  }

  if (type === 'space') {
    if (chord) return `${(Math.max(1.8, chord.length * 0.55 + 0.5) * lyricsFontSize).toFixed(1)}pt`;
    return `${(lyricsFontSize * 0.6).toFixed(1)}pt`;
  }

  if (type === 'en') {
    const textWidth = lyricsFontSize * 0.6 * text.length;
    if (!chord) return `${Math.max(lyricsFontSize * 1.0, textWidth).toFixed(1)}pt`;
    const chordWidth = Math.max(1.8, chord.length * 0.55 + 0.5) * lyricsFontSize;
    return `${Math.max(chordWidth, textWidth).toFixed(1)}pt`;
  }

  // type === 'ja'
  if (!chord) return `${(lyricsFontSize * 1.4).toFixed(1)}pt`;
  const emFactor = Math.max(1.8, chord.length * 0.55 + 0.5);
  return `${(emFactor * lyricsFontSize).toFixed(1)}pt`;
}

// 画面上のセル幅（chord-cell・char-cell 共通）
function calcScreenWidth(chunk) {
  if (!chunk || chunk.type === 'ja') return undefined;
  if (chunk.type === 'en') return `${chunk.text.length}ch`;
  if (chunk.type === 'space') return '0.8em';
  return undefined;
}

export default function ScoreGrid({ lines, chords, keyRoot, keyType, lyricsFontSize, onChordsChange }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const chordKey = (row, col) => `${row}_${col}`;

  const handleSelect = useCallback((row, col) => {
    setSelectedCell({ row, col });
  }, []);

  const handleContextMenu = useCallback((e, row, col) => {
    setContextMenu({ x: e.clientX, y: e.clientY, row, col });
  }, []);

  const handleChordChange = useCallback((row, col, chord) => {
    const next = { ...chords };
    const key = chordKey(row, col);
    if (chord) {
      next[key] = chord;
    } else {
      delete next[key];
    }
    onChordsChange(next);
  }, [chords, onChordsChange]);

  const handleContextSelect = (chord) => {
    if (contextMenu) {
      handleChordChange(contextMenu.row, contextMenu.col, chord);
    }
    setContextMenu(null);
  };

  const handleContextClear = () => {
    if (contextMenu) {
      handleChordChange(contextMenu.row, contextMenu.col, null);
    }
    setContextMenu(null);
  };

  const handleGridClick = (e) => {
    if (!e.target.closest('.chord-cell')) {
      setSelectedCell(null);
    }
  };

  const renderChordRow = (lineIndex, cellCount, trailStart = Infinity, chunks = []) => (
    <div className="score-chord-row">
      {Array.from({ length: cellCount }, (_, colIndex) => {
        const key = chordKey(lineIndex, colIndex);
        const chord = chords[key] || null;
        const isSelected = selectedCell?.row === lineIndex && selectedCell?.col === colIndex;
        const isTrail = colIndex >= trailStart;
        const chunk = isTrail ? { type: 'trail', text: '' } : (chunks[colIndex] || { type: 'ja', text: '' });
        const sw = calcScreenWidth(chunk);
        return (
          <ChordCell
            key={colIndex}
            rowIndex={lineIndex}
            colIndex={colIndex}
            chord={chord}
            selected={isSelected}
            trail={isTrail}
            printWidth={calcPrintWidth(chord, lyricsFontSize, chunk)}
            screenWidth={sw}
            onSelect={handleSelect}
            onContextMenu={handleContextMenu}
            onChange={(chord) => handleChordChange(lineIndex, colIndex, chord)}
          />
        );
      })}
    </div>
  );

  return (
    <div className="score-grid" onClick={handleGridClick}>
      {lines.map((line, lineIndex) => {
        if (line === '') {
          return (
            <div key={lineIndex} className="score-line-group">
              {renderChordRow(lineIndex, CHORD_ONLY_CELLS)}
            </div>
          );
        }

        if (isLabelLine(line)) {
          return (
            <div key={lineIndex} className="score-line-group">
              {renderChordRow(lineIndex, CHORD_ONLY_CELLS)}
              <div className="label-row">{line}</div>
            </div>
          );
        }

        const chunks = splitIntoChunks(line);
        const totalCells = chunks.length + TRAILING_CELLS;

        return (
          <div key={lineIndex} className="score-line-group">
            {renderChordRow(lineIndex, totalCells, chunks.length, chunks)}
            <div className="score-lyrics-row">
              {chunks.map((chunk, colIndex) => {
                const sw = calcScreenWidth(chunk);
                return (
                  <div
                    key={colIndex}
                    className={`char-cell char-cell-${chunk.type}`}
                    style={{
                      '--print-width': calcPrintWidth(chords[chordKey(lineIndex, colIndex)] || null, lyricsFontSize, chunk),
                      ...(sw ? { width: sw } : {}),
                    }}
                  >
                    {chunk.type === 'space' ? ' ' : chunk.text}
                  </div>
                );
              })}
              {Array.from({ length: TRAILING_CELLS }, (_, i) => (
                <div key={`trail-${i}`} className="char-cell char-cell-trail" />
              ))}
            </div>
          </div>
        );
      })}

      {contextMenu && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          keyRoot={keyRoot}
          keyType={keyType}
          onSelect={handleContextSelect}
          onClear={handleContextClear}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
