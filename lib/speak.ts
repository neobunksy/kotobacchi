export function speak(text: string) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.75;
  utter.pitch = 1.0;
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
