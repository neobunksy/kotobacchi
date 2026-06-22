export function speak(text: string) {
  if (typeof window === 'undefined') return;

  // まず WAV ファイルを試す
  const audioPath = `/audio/${text}.wav`;
  const audio = new Audio(audioPath);

  audio.onerror = () => {
    // WAV がなければ MP3 を試す
    const mp3Path = `/audio/${text}.mp3`;
    const audio2 = new Audio(mp3Path);
    audio2.onerror = () => {
      // どちらも失敗 → Web Speech API フォールバック
      speakWithSpeechSynthesis(text);
    };
    audio2.play().catch(() => speakWithSpeechSynthesis(text));
  };

  audio.play().catch(() => {
    // play() が即座にエラーの場合
    speakWithSpeechSynthesis(text);
  });
}

function speakWithSpeechSynthesis(text: string) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.75;
  utter.pitch = 1.0;  // 1.5 から変更（iPhone バグ対策）
  utter.volume = 1.0;

  const trySpeak = () => {
    const voices = synth.getVoices();
    const jaVoices = voices.filter(v => v.lang.startsWith('ja'));
    const preferred = jaVoices.find(v =>
      v.name.includes('Kyoko') ||
      v.name.includes('Haruka') ||
      v.name.toLowerCase().includes('female') ||
      v.name.includes('Google 日本語')
    ) ?? jaVoices[0];
    if (preferred) utter.voice = preferred;
    synth.speak(utter);
  };

  if (synth.getVoices().length > 0) {
    trySpeak();
  } else {
    synth.addEventListener('voiceschanged', trySpeak, { once: true });
  }
}
