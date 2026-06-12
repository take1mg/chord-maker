const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// フラット表記を使うキーのルートインデックス
const FLAT_ROOT_INDICES = new Set([1, 3, 5, 8, 10]); // Db, Eb, F, Ab, Bb

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];
const MINOR_QUALITIES = ['m', 'dim', '', 'm', 'm', '', ''];

function noteName(index, useFlat) {
  return useFlat ? FLAT_NOTES[index % 12] : SHARP_NOTES[index % 12];
}

function getDiatonicChords(rootIndex, isMinor) {
  const useFlat = FLAT_ROOT_INDICES.has(rootIndex);
  const intervals = isMinor ? MINOR_INTERVALS : MAJOR_INTERVALS;
  const qualities = isMinor ? MINOR_QUALITIES : MAJOR_QUALITIES;
  return intervals.map((interval, i) =>
    noteName(rootIndex + interval, useFlat) + qualities[i]
  );
}

function getSeventhChords(rootIndex, isMinor) {
  const useFlat = FLAT_ROOT_INDICES.has(rootIndex);
  const n = (i) => noteName(rootIndex + i, useFlat);

  if (!isMinor) {
    return [
      n(0) + 'maj7',
      n(2) + 'm7',
      n(4) + 'm7',
      n(5) + 'maj7',
      n(7) + '7',
      n(9) + 'm7',
    ];
  } else {
    return [
      n(0) + 'm7',
      n(5) + 'm7',
      n(7) + '7',   // ドミナント（ハーモニックマイナー）
      n(8) + 'maj7',
      n(10) + '7',
    ];
  }
}

function getOtherChords(rootIndex, isMinor) {
  const useFlat = FLAT_ROOT_INDICES.has(rootIndex);
  const n = (i) => noteName(rootIndex + i, useFlat);

  const chords = [
    n(0) + 'sus4',
    n(7) + 'sus4',
    n(0) + 'add9',
    n(0) + '6',
  ];

  if (!isMinor) {
    // 借用和音（メジャーキー）
    chords.push(n(10));       // bVII
    chords.push(n(8));        // bVI
    chords.push(n(5) + 'm');  // IVm
    chords.push(n(2) + '7');  // II7（セカンダリードミナント）
    chords.push(n(4) + '7');  // III7
  } else {
    // マイナーキーの追加コード
    chords.push(n(10));      // bVII
    chords.push(n(8));       // bVI
    chords.push(n(3));       // bIII
    chords.push(n(5));       // IV
    chords.push(n(7));       // V（ナチュラル）
  }

  return chords;
}

export function getChordMenuData(rootIndex, isMinor) {
  return {
    diatonic: getDiatonicChords(rootIndex, isMinor),
    sevenths: getSeventhChords(rootIndex, isMinor),
    others: getOtherChords(rootIndex, isMinor),
  };
}

export const KEY_OPTIONS = [
  { label: 'C',    rootIndex: 0  },
  { label: 'G',    rootIndex: 7  },
  { label: 'D',    rootIndex: 2  },
  { label: 'A',    rootIndex: 9  },
  { label: 'E',    rootIndex: 4  },
  { label: 'B',    rootIndex: 11 },
  { label: 'F# / Gb', rootIndex: 6 },
  { label: 'F',    rootIndex: 5  },
  { label: 'Bb',   rootIndex: 10 },
  { label: 'Eb',   rootIndex: 3  },
  { label: 'Ab',   rootIndex: 8  },
  { label: 'Db',   rootIndex: 1  },
];
