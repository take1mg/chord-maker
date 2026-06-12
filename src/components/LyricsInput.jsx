import { useRef, useState } from 'react';
import { loadTextFile } from '../utils/fileIO';
import './LyricsInput.css';

const PRESET_LABELS = ['イントロ', 'Aメロ', 'Bメロ', 'サビ', 'Cメロ', '大サビ', '間奏', 'アウトロ'];

export default function LyricsInput({ lyrics, onChange, onGenerate }) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [customLabel, setCustomLabel] = useState('');

  const handleFileLoad = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await loadTextFile(file);
      onChange(text);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  // カーソル位置に [ラベル]\n を挿入
  const insertLabel = (label) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = lyrics.substring(0, start);
    const after = lyrics.substring(end);

    // 行頭でなければ改行を先に入れる
    const needsLeadingNewline = start > 0 && lyrics[start - 1] !== '\n';
    const insertion = (needsLeadingNewline ? '\n' : '') + `[${label}]\n`;

    onChange(before + insertion + after);

    // カーソルをラベルの直後に移動
    const nextPos = start + insertion.length;
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(nextPos, nextPos);
    }, 0);
  };

  const handleCustomInsert = () => {
    const label = customLabel.trim();
    if (!label) return;
    insertLabel(label);
    setCustomLabel('');
  };

  return (
    <div className="lyrics-input-container">
      <div className="lyrics-input-header">
        <h2>歌詞入力</h2>
        <div className="lyrics-input-actions">
          <button onClick={() => fileInputRef.current.click()}>
            ファイル読み込み
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            style={{ display: 'none' }}
            onChange={handleFileLoad}
          />
          <button className="btn-primary" onClick={onGenerate}>
            コード譜を作成 →
          </button>
        </div>
      </div>

      {/* セクションラベル挿入パネル */}
      <div className="label-insert-panel">
        <span className="label-insert-title">セクション挿入</span>
        <div className="label-preset-group">
          {PRESET_LABELS.map((label) => (
            <button
              key={label}
              className="label-preset-btn"
              onClick={() => insertLabel(label)}
              title={`[${label}] を挿入`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="label-custom-group">
          <input
            type="text"
            className="label-custom-input"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomInsert(); }}
            placeholder="カスタム..."
            maxLength={20}
          />
          <button
            className="label-custom-btn"
            onClick={handleCustomInsert}
            disabled={!customLabel.trim()}
          >
            挿入
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="lyrics-textarea"
        value={lyrics}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`歌詞をここに貼り付けてください\n\n例:\n[イントロ]\n\n[Aメロ]\n君の瞳に映る星が\n輝いている\n\n[間奏]\n\n[サビ]\n空の青さが\n心に染みる`}
      />

      <p className="lyrics-hint">
        ヒント: セクション挿入ボタンでカーソル位置にラベルを挿入。空行もコードを書けます。
      </p>
    </div>
  );
}
