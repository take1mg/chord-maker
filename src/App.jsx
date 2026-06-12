import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LyricsInput from './components/LyricsInput';
import ScoreGrid from './components/ScoreGrid';
import './App.css';

export default function App() {
  const [title, setTitle] = useState('');
  const [keyRoot, setKeyRoot] = useState(0);
  const [keyType, setKeyType] = useState('major');
  const [lyrics, setLyrics] = useState('');
  const [lines, setLines] = useState(null);
  const [chords, setChords] = useState({});
  const [lyricsFontSize, setLyricsFontSize] = useState(12); // pt

  useEffect(() => {
    const styleId = 'dynamic-print-style';
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    const fs = lyricsFontSize;
    el.textContent = `@media print {
  .char-cell { font-size: ${fs}pt !important; }
  .chord-label { font-size: ${(fs * 0.78).toFixed(1)}pt !important; }
  .label-row { font-size: ${(fs * 0.85).toFixed(1)}pt !important; }
  .score-empty-line { height: ${(fs * 0.6).toFixed(1)}pt; }
  .chord-cell { min-height: ${(fs * 1.2).toFixed(1)}pt !important; }
}`;
  }, [lyricsFontSize]);

  const handleGenerate = () => {
    if (!lyrics.trim()) {
      alert('歌詞を入力してください');
      return;
    }
    setLines(lyrics.split('\n'));
    setChords({});
  };

  const handleBackToEdit = () => {
    setLines(null);
  };

  const handleProjectLoad = useCallback((data) => {
    setTitle(data.title || '');
    setKeyRoot(data.keyRoot ?? 0);
    setKeyType(data.keyType || 'major');
    setLyrics(data.lyrics || '');
    setChords(data.chords || {});
    if (data.lyricsFontSize) setLyricsFontSize(data.lyricsFontSize);
    if (data.lyrics) {
      setLines(data.lyrics.split('\n'));
    }
  }, []);

  const showScore = lines !== null;

  return (
    <div className="app-container">
      <Header
        title={title}
        onTitleChange={setTitle}
        keyRoot={keyRoot}
        onKeyRootChange={setKeyRoot}
        keyType={keyType}
        onKeyTypeChange={setKeyType}
        lyrics={lyrics}
        chords={chords}
        lyricsFontSize={lyricsFontSize}
        onFontSizeChange={setLyricsFontSize}
        onProjectLoad={handleProjectLoad}
        showScore={showScore}
      />

      {!showScore ? (
        <LyricsInput
          lyrics={lyrics}
          onChange={setLyrics}
          onGenerate={handleGenerate}
        />
      ) : (
        <div className="score-section" style={{ '--lyrics-font-size': lyricsFontSize + 'pt' }}>
          <div className="score-toolbar no-print">
            <button onClick={handleBackToEdit}>← 歌詞を編集</button>
            <span className="score-hint">
              コードを入力: マスを右クリック（コード選択）またはダブルクリック（直接入力）
            </span>
          </div>

          {title && (
            <div className="score-title">{title}</div>
          )}

          <ScoreGrid
            lines={lines}
            chords={chords}
            keyRoot={keyRoot}
            keyType={keyType}
            lyricsFontSize={lyricsFontSize}
            onChordsChange={setChords}
          />
        </div>
      )}
    </div>
  );
}
