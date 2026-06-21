'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AiBuddy from '@/components/AiBuddy';
import BackButton from '@/components/BackButton';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'ai',
  text: 'こんにちは！なにかはなしかけてね！🐰',
};

function speak(text: string) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  synth.speak(utter);
}

export default function HanashiPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = (await res.json()) as { reply: string };
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: data.reply,
      };
      setMessages(prev => [...prev, aiMsg]);
      // AI応答を読み上げ
      speak(data.reply);
    } catch {
      const errMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: 'ごめんね、うまくきこえなかった！もういちどいってね！',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert('このブラウザはマイクをつかえないよ。もじをうってね！');
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInputText(transcript);
        sendMessage(transcript);
      }
    };

    recognition.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #C8B8E8 0%, #E8E0F5 100%)' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center px-4 pt-6 pb-2 relative z-10">
        <BackButton href="/" />
        <h1 className="ml-4 text-xl font-bold" style={{ color: '#4A4A4A' }}>💬 おはなし</h1>
      </div>

      {/* AIキャラクター */}
      <div className="flex justify-center py-2 relative z-10">
        <AiBuddy size={80} />
      </div>

      {/* 会話ログ */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="rounded-3xl px-4 py-3 max-w-[75%] shadow-md"
                style={{
                  backgroundColor: msg.role === 'user' ? '#FFB7C5' : 'rgba(255,255,255,0.9)',
                  color: '#4A4A4A',
                  borderRadius: msg.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                }}
              >
                <p className="text-base font-medium leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="rounded-3xl px-5 py-3 shadow-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '24px 24px 24px 6px' }}
              >
                <div className="flex gap-1 items-center">
                  <span className="animate-hop text-lg">🐰</span>
                  <span style={{ color: '#888' }} className="text-sm">かんがえちゅう...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア */}
      <div
        className="px-4 pb-6 pt-3 relative z-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderTop: '2px solid rgba(200,184,232,0.4)' }}
      >
        <div className="flex gap-2 items-center max-w-sm mx-auto">
          {/* マイクボタン */}
          <button
            onClick={isListening ? stopListening : startListening}
            className="rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center"
            style={{
              backgroundColor: isListening ? '#FF6B6B' : '#C8B8E8',
              minWidth: '60px',
              minHeight: '60px',
              border: '3px solid rgba(255,255,255,0.8)',
              animation: isListening ? 'gentlePulse 1s ease-in-out infinite' : undefined,
            }}
            aria-label={isListening ? 'マイクをとめる' : 'マイクをつかう'}
          >
            <span className="text-2xl">{isListening ? '⏹' : '🎤'}</span>
          </button>

          {/* テキスト入力 */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(inputText); }}
            placeholder="ここにかいてね"
            className="flex-1 rounded-full px-4 py-3 font-bold outline-none border-2 transition-all"
            style={{
              borderColor: inputText ? '#C8B8E8' : '#E0E0E0',
              color: '#4A4A4A',
              backgroundColor: 'white',
              minHeight: '52px',
              fontSize: '1rem',
            }}
            disabled={isLoading}
          />

          {/* 送信ボタン */}
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center"
            style={{
              backgroundColor: inputText.trim() && !isLoading ? '#FFB7C5' : '#E0E0E0',
              minWidth: '60px',
              minHeight: '60px',
              border: '3px solid rgba(255,255,255,0.8)',
            }}
            aria-label="おくる"
          >
            <span className="text-2xl">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}
