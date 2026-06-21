'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton';

type OtoTab = 'piano' | 'drum' | 'animal';

// ピアノ音階
const PIANO_KEYS = [
  { label: 'ド', freq: 261.63, color: '#FFB7C5' },
  { label: 'レ', freq: 293.66, color: '#FFE66D' },
  { label: 'ミ', freq: 329.63, color: '#98E4D6' },
  { label: 'ファ', freq: 349.23, color: '#87CEEB' },
  { label: 'ソ', freq: 392.00, color: '#C8B8E8' },
  { label: 'ラ', freq: 440.00, color: '#FFB347' },
  { label: 'シ', freq: 493.88, color: '#B8E6F8' },
];

// ドラム
const DRUM_PADS = [
  { label: 'キック', emoji: '🥁', color: '#FFB7C5', type: 'kick' },
  { label: 'スネア', emoji: '🪘', color: '#FFE66D', type: 'snare' },
  { label: 'ハイハット', emoji: '🎵', color: '#98E4D6', type: 'hihat' },
  { label: 'シンバル', emoji: '🔔', color: '#C8B8E8', type: 'cymbal' },
];

// 動物
const ANIMALS = [
  { name: 'いぬ', emoji: '🐕', sound: 'わんわん！' },
  { name: 'ねこ', emoji: '🐈', sound: 'にゃーにゃー！' },
  { name: 'うし', emoji: '🐄', sound: 'もーもー！' },
  { name: 'うま', emoji: '🐎', sound: 'ひひーん！' },
  { name: 'ぶた', emoji: '🐷', sound: 'ぶーぶー！' },
  { name: 'ひつじ', emoji: '🐑', sound: 'めーめー！' },
  { name: 'ライオン', emoji: '🦁', sound: 'がおー！' },
  { name: 'ぞう', emoji: '🐘', sound: 'ぱおーん！' },
];

function playTone(audioCtx: AudioContext, freq: number, duration = 0.6) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playDrum(audioCtx: AudioContext, type: string) {
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'kick') {
    // キック：低周波ノイズ
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } else {
    // ノイズベース
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audioCtx.destination);

    const duration = type === 'hihat' ? 0.08 : type === 'cymbal' ? 0.5 : 0.15;
    gain.gain.setValueAtTime(type === 'cymbal' ? 0.2 : 0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    source.start();
    source.stop(audioCtx.currentTime + duration);
  }
}

function speak(text: string) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  synth.speak(utter);
}

export default function OtoPage() {
  const [tab, setTab] = useState<OtoTab>('piano');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeDrum, setActiveDrum] = useState<string | null>(null);
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const handlePianoKey = useCallback((label: string, freq: number) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    setActiveKey(label);
    setTimeout(() => setActiveKey(null), 300);
    playTone(ctx, freq);
  }, [getAudioCtx]);

  const handleDrum = useCallback((type: string) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    setActiveDrum(type);
    setTimeout(() => setActiveDrum(null), 300);
    playDrum(ctx, type);
  }, [getAudioCtx]);

  const handleAnimal = useCallback((name: string, sound: string) => {
    setActiveAnimal(name);
    setTimeout(() => setActiveAnimal(null), 500);
    speak(sound);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #98E4D6 0%, #D0F5EE 100%)' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center px-4 pt-6 pb-2 relative z-10">
        <BackButton href="/" />
      </div>

      <h1 className="text-center text-2xl font-bold py-2 relative z-10" style={{ color: '#4A4A4A' }}>
        🎵 おとであそぶ
      </h1>

      {/* タブ切り替え */}
      <div className="flex mx-4 gap-2 mb-4 relative z-10">
        {(['piano', 'drum', 'animal'] as OtoTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-full py-2.5 font-bold text-sm transition-all"
            style={{
              backgroundColor: tab === t ? '#4A4A4A' : 'rgba(255,255,255,0.85)',
              color: tab === t ? 'white' : '#4A4A4A',
              minHeight: '48px',
              transform: tab === t ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {t === 'piano' ? '🎹 ピアノ' : t === 'drum' ? '🥁 ドラム' : '🐶 どうぶつ'}
          </button>
        ))}
      </div>

      {/* ピアノ */}
      {tab === 'piano' && (
        <div className="flex flex-col items-center flex-1 px-4 gap-3 relative z-10">
          <p className="text-sm font-bold text-center" style={{ color: '#4A4A4A', opacity: 0.7 }}>
            おんぷをおしてみよう！
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {PIANO_KEYS.map(key => (
              <button
                key={key.label}
                onClick={() => handlePianoKey(key.label, key.freq)}
                className="rounded-full font-bold text-2xl transition-all active:scale-95 shadow-lg"
                style={{
                  backgroundColor: key.color,
                  minHeight: '70px',
                  color: '#4A4A4A',
                  border: '3px solid rgba(255,255,255,0.8)',
                  transform: activeKey === key.label ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: activeKey === key.label
                    ? `0 0 20px ${key.color}, 0 4px 16px ${key.color}`
                    : `0 4px 12px ${key.color}80`,
                  transition: 'all 0.15s ease',
                }}
              >
                {key.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ドラム */}
      {tab === 'drum' && (
        <div className="flex flex-col items-center flex-1 px-4 relative z-10">
          <p className="text-sm font-bold text-center mb-4" style={{ color: '#4A4A4A', opacity: 0.7 }}>
            たたいてみよう！
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {DRUM_PADS.map(pad => (
              <button
                key={pad.type}
                onClick={() => handleDrum(pad.type)}
                className="rounded-full font-bold transition-all active:scale-90 shadow-lg flex flex-col items-center justify-center"
                style={{
                  backgroundColor: pad.color,
                  minHeight: '110px',
                  color: '#4A4A4A',
                  border: '3px solid rgba(255,255,255,0.8)',
                  transform: activeDrum === pad.type ? 'scale(0.92) rotate(-3deg)' : 'scale(1)',
                  boxShadow: activeDrum === pad.type
                    ? `0 0 20px ${pad.color}`
                    : `0 6px 16px ${pad.color}80`,
                  transition: 'all 0.1s ease',
                }}
              >
                <span className="text-4xl">{pad.emoji}</span>
                <span className="text-sm font-bold mt-1">{pad.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 動物 */}
      {tab === 'animal' && (
        <div className="flex flex-col items-center flex-1 px-4 relative z-10">
          <p className="text-sm font-bold text-center mb-4" style={{ color: '#4A4A4A', opacity: 0.7 }}>
            どうぶつをタップしてみよう！
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {ANIMALS.map(animal => (
              <button
                key={animal.name}
                onClick={() => handleAnimal(animal.name, animal.sound)}
                className="rounded-3xl font-bold transition-all active:scale-90 shadow-lg flex flex-col items-center justify-center py-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  minHeight: '100px',
                  color: '#4A4A4A',
                  border: activeAnimal === animal.name ? '3px solid #FFB347' : '2px solid rgba(255,255,255,0.6)',
                  transform: activeAnimal === animal.name ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: activeAnimal === animal.name
                    ? '0 0 20px rgba(255,179,71,0.6)'
                    : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="text-5xl">{animal.emoji}</span>
                <span className="text-base font-bold mt-1">{animal.name}</span>
                {activeAnimal === animal.name && (
                  <span className="text-xs mt-1 font-bold" style={{ color: '#FFB347' }}>{animal.sound}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
