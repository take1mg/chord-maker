import { useRef } from 'react';
import { KEY_OPTIONS } from '../utils/musicTheory';
import { saveProject, loadProjectFile } from '../utils/fileIO';
import './Header.css';

export default function Header({
  title, onTitleChange,
  keyRoot, onKeyRootChange,
  keyType, onKeyTypeChange,
  lyrics, chords,
  lyricsFontSize, onFontSizeChange,
  onProjectLoad,
  showScore,
}) {
  const projectFileRef = useRef(null);

  const handleSave = () => {
    saveProject(title, keyRoot, keyType, lyrics, chords, lyricsFontSize);
  };

  const handleProjectFileLoad = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await loadProjectFile(file);
      onProjectLoad(data);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  return (
    <header className="app-header">
      <div className="header-title-area">
        <span className="app-logo">♪</span>
        <span className="app-name">コード譜メーカー</span>
      </div>

      <div className="header-controls no-print">
        <div className="control-group">
          <label>曲タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="タイトルを入力"
            className="title-input"
          />
        </div>

        <div className="control-group">
          <label>キー</label>
          <select value={keyRoot} onChange={(e) => onKeyRootChange(Number(e.target.value))}>
            {KEY_OPTIONS.map(({ label, rootIndex }) => (
              <option key={rootIndex} value={rootIndex}>{label}</option>
            ))}
          </select>
          <select value={keyType} onChange={(e) => onKeyTypeChange(e.target.value)}>
            <option value="major">メジャー</option>
            <option value="minor">マイナー</option>
          </select>
        </div>

        <div className="control-group">
          <label>文字サイズ</label>
          <select value={lyricsFontSize} onChange={(e) => onFontSizeChange(Number(e.target.value))}>
            {[10, 11, 12, 13, 14, 15].map(pt => (
              <option key={pt} value={pt}>{pt}pt</option>
            ))}
          </select>
        </div>

        <div className="control-group control-group-actions">
          {showScore && (
            <button onClick={handleSave} title="JSON形式で保存">
              保存
            </button>
          )}
          <button onClick={() => projectFileRef.current.click()} title="保存済みプロジェクトを開く">
            開く
          </button>
          <input
            ref={projectFileRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleProjectFileLoad}
          />
          <button onClick={() => window.print()}>
            印刷
          </button>
        </div>
      </div>
    </header>
  );
}
