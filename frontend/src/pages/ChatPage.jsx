import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/axios';
import { FiSend, FiUser, FiActivity, FiFileText, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';

/* ───────────────────────────────────────
   Styles
   ─────────────────────────────────────── */
const s = {
  pageWrap: { display: 'flex', gap: 20, height: 'calc(100vh - 100px)' },

  /* ── Left Panel: Doctor ── */
  doctorPanel: {
    width: 300, flexShrink: 0,
    background: '#ffffff', border: '1px solid rgba(0,80,160,0.08)',
    borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 1px 8px rgba(0,80,160,0.04)',
    display: 'flex', flexDirection: 'column',
  },
  doctorHeader: {
    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    padding: '28px 20px', textAlign: 'center', color: 'white',
  },
  doctorImgWrap: {
    position: 'relative', width: 110, height: 110, margin: '0 auto 12px',
  },
  doctorImg: (speaking) => ({
    width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
    border: `4px solid ${speaking ? '#34d399' : 'rgba(255,255,255,0.5)'}`,
    boxShadow: speaking ? '0 0 30px rgba(52,211,153,0.5)' : '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'all 0.4s ease',
  }),
  speakingRing: (speaking) => ({
    position: 'absolute', inset: -6, borderRadius: '50%',
    border: '3px solid #34d399',
    animation: speaking ? 'pulse 1.5s ease-in-out infinite' : 'none',
    opacity: speaking ? 1 : 0, transition: 'opacity 0.3s',
  }),
  doctorName: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  doctorRole: { fontSize: 12, opacity: 0.85 },
  doctorStatus: (speaking, listening) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    marginTop: 10, padding: '4px 12px', borderRadius: 20,
    background: speaking ? 'rgba(52,211,153,0.2)' : listening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.15)',
    fontSize: 11, fontWeight: 600,
  }),
  statusDot: (color) => ({
    width: 7, height: 7, borderRadius: '50%', background: color,
    animation: 'pulse 1s ease-in-out infinite',
  }),

  /* Reports list */
  reportsList: { flex: 1, overflowY: 'auto', padding: 16 },
  reportsTitle: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 },
  reportItem: (active) => ({
    padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
    background: active ? 'rgba(2,132,199,0.08)' : 'transparent',
    border: `1px solid ${active ? 'rgba(2,132,199,0.2)' : 'transparent'}`,
    color: active ? '#0284c7' : '#64748b', fontSize: 13, fontWeight: active ? 600 : 400,
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
  }),

  /* ── Right Panel: Chat ── */
  chatMain: {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: '#ffffff', border: '1px solid rgba(0,80,160,0.08)',
    borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 1px 8px rgba(0,80,160,0.04)',
  },
  chatHeader: {
    padding: '14px 20px', borderBottom: '1px solid rgba(0,80,160,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#fafcff',
  },
  chatTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 },
  headerControls: { display: 'flex', gap: 8, alignItems: 'center' },
  langBtn: (active) => ({
    padding: '4px 10px', borderRadius: 6,
    border: `1px solid ${active ? '#0284c7' : 'rgba(0,80,160,0.12)'}`,
    background: active ? 'rgba(2,132,199,0.08)' : 'transparent',
    color: active ? '#0284c7' : '#94a3b8',
    cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif',
  }),
  autoVoiceBtn: (on) => ({
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6,
    border: `1px solid ${on ? '#059669' : 'rgba(0,80,160,0.12)'}`,
    background: on ? 'rgba(5,150,105,0.08)' : 'transparent',
    color: on ? '#059669' : '#94a3b8',
    cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif',
  }),
  stopBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 12px', borderRadius: 6,
    border: '1px solid #dc2626',
    background: 'rgba(220,38,38,0.08)',
    color: '#dc2626',
    cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
    animation: 'pulse 1s ease-in-out infinite',
  },
  stopBarBtn: {
    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    border: 'none', color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(220,38,38,0.35)', transition: 'all 0.2s',
    fontWeight: 700, fontSize: 13, fontFamily: 'Inter, sans-serif',
  },

  /* Messages */
  msgList: { flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' },
  bubble: (isUser) => ({
    display: 'flex', gap: 10, marginBottom: 18,
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
  }),
  avatar: (isUser) => ({
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    background: isUser ? 'rgba(2,132,199,0.1)' : 'transparent',
  }),
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
  msgBubble: (isUser) => ({
    maxWidth: '75%', padding: '12px 16px',
    borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
    background: isUser ? '#e0f2fe' : '#ffffff',
    border: `1px solid ${isUser ? 'rgba(2,132,199,0.15)' : 'rgba(0,80,160,0.08)'}`,
    color: '#1e293b', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
    boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
  }),
  speakSmallBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 5,
    background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.12)',
    color: '#059669', cursor: 'pointer', fontSize: 10, fontWeight: 600,
    fontFamily: 'Inter, sans-serif', marginTop: 6,
  },

  /* Input bar */
  inputBar: {
    padding: '14px 16px', borderTop: '1px solid rgba(0,80,160,0.08)',
    display: 'flex', gap: 10, alignItems: 'flex-end',
    background: '#fafcff',
  },
  textarea: {
    flex: 1, padding: '12px 14px', resize: 'none',
    background: '#f1f5f9', border: '1px solid rgba(0,80,160,0.12)',
    borderRadius: 10, color: '#0f172a', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none', lineHeight: 1.5,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    border: 'none', color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(2,132,199,0.25)', transition: 'all 0.2s',
  },
  micBtn: (recording) => ({
    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
    background: recording
      ? 'linear-gradient(135deg, #dc2626, #ef4444)'
      : 'linear-gradient(135deg, #059669, #34d399)',
    border: 'none', color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: recording ? '0 4px 15px rgba(220,38,38,0.3)' : '0 4px 15px rgba(5,150,105,0.2)',
    transition: 'all 0.2s', animation: recording ? 'pulse 1.2s ease-in-out infinite' : 'none',
  }),

  /* Empty state */
  empty: { textAlign: 'center', paddingTop: 50, color: '#94a3b8' },
  emptyTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#475569' },
  suggestionsWrap: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 16 },
  suggestionBtn: {
    background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.15)',
    borderRadius: 8, padding: '8px 16px', color: '#0284c7',
    cursor: 'pointer', fontSize: 13, maxWidth: 360, textAlign: 'center',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
  },
};

const SUGGESTIONS = [
  'Doctor, please explain my diet plan based on my report.',
  'రిపోర్టు ప్రకారం నా డైట్ ప్లాన్ ఏమిటి? (What is my diet plan?)',
  'What foods should I eat or avoid?',
  'ఏ ఏ ఆహార పదార్థాలు నేను తీసుకోకూడదు? (What foods should I not take?)',
  'Let\'s build a personalized meal plan together.',
];

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(searchParams.get('reportId') || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('te');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true); // doctor speaks automatically
  const bottomRef = useRef();
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    api.get('/reports/').then((r) => setReports(r.data.reports || []));
  }, []);

  useEffect(() => {
    if (selectedReport) {
      api.get(`/chat/${selectedReport}/history`)
        .then((r) => setMessages(r.data.map((h) => ([
          { role: 'user', text: h.question, time: h.created_at },
          { role: 'ai', text: h.answer, time: h.created_at },
        ])).flat()))
        .catch(() => setMessages([]));
    }
  }, [selectedReport]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── TTS: Doctor speaks ── */
  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const playCloudTTS = (text, languageCode) => {
    stopSpeaking();
    
    // Split text into chunks of maximum 150 characters
    const chunks = [];
    const rawChunks = text.split(/([।\n!\?\.,:;()（）])/);
    let currentChunk = "";
    
    for (const part of rawChunks) {
      if (!part) continue;
      if ((currentChunk + part).length > 150) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = part;
      } else {
        currentChunk += part;
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    if (chunks.length === 0) return;

    setIsSpeaking(true);
    let index = 0;

    const playNext = () => {
      if (index >= chunks.length) {
        setIsSpeaking(false);
        audioRef.current = null;
        return;
      }
      
      const chunk = chunks[index];
      index++;

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${languageCode}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = playNext;
      audio.onerror = (e) => {
        console.error("Cloud TTS error, trying next chunk...", e);
        playNext();
      };
      
      audio.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsSpeaking(false);
        audioRef.current = null;
      });
    };

    playNext();
  };

  const speakAnswer = (text) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    
    let textToSpeak = text;
    if (lang === 'te') {
      // 1. Remove brackets with English words/numbers, e.g. (Protein) or (dal) or (Vitamin B-12)
      textToSpeak = textToSpeak.replace(/\([A-Za-z0-9\s,\-\./+]*\)/g, '');
      // 2. Remove any remaining standalone English words/letters
      textToSpeak = textToSpeak.replace(/[A-Za-z]+/g, '');
      // 3. Clean up extra spaces/empty lines
      textToSpeak = textToSpeak.replace(/\s+/g, ' ').trim();
      
      // Check if browser has a native Telugu voice installed
      const voices = window.speechSynthesis.getVoices();
      const hasTeluguVoice = voices.some(
        v => v.lang && (v.lang.startsWith('te') || v.lang.includes('te-') || v.lang.includes('te_'))
      );

      if (!hasTeluguVoice) {
        // Fallback to high-quality Cloud TTS if no native Telugu voice is on this machine
        playCloudTTS(textToSpeak, 'te');
        return;
      }
    }

    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.lang = lang === 'te' ? 'te-IN' : 'en-US';
    utter.rate = 0.88;
    utter.pitch = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (lang === 'te') {
      selectedVoice = voices.find(
        v => v.lang && (v.lang.startsWith('te') || v.lang.includes('te-') || v.lang.includes('te_'))
      );
    } else {
      selectedVoice = voices.find(
        v => v.name.toLowerCase().includes('female')
          || v.name.toLowerCase().includes('zira')
          || v.name.toLowerCase().includes('samantha')
      );
    }
    if (selectedVoice) utter.voice = selectedVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  /* ── Send message ── */
  const sendMessage = async (text, spokenByUser = false) => {
    const q = (text || input).trim();
    if (!q || !selectedReport) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await api.post(`/chat/${selectedReport}`, { question: q, language: lang });
      const answer = res.data.answer;
      setMessages((m) => [...m, { role: 'ai', text: answer }]);
      // Auto-speak if the user spoke, or if autoVoice is on
      if (autoVoice || spokenByUser) {
        speakAnswer(answer);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get answer');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  /* ── Voice: Start mic ── */
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech Recognition not supported. Please use Chrome.');
      return;
    }
    if (!selectedReport) {
      toast.error('Please select a report first.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'te' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onerror = (e) => { setRecording(false); toast.error(`Mic error: ${e.error}`); };
    recognition.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      setInput('');
      await sendMessage(text, true); // mark as spoken
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getStatusText = () => {
    if (isSpeaking) return { text: 'Speaking...', color: '#34d399' };
    if (recording) return { text: 'Listening...', color: '#ef4444' };
    if (loading) return { text: 'Thinking...', color: '#38bdf8' };
    return { text: 'Ready', color: '#94a3b8' };
  };
  const status = getStatusText();

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>AI Doctor Consulting</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Upload your report, then speak or type to consult with your AI doctor.</p>
      </div>
      <div style={s.pageWrap}>

        {/* ── Left Panel: Doctor Profile + Reports ── */}
        <div style={s.doctorPanel}>
          <div style={s.doctorHeader}>
            <div style={s.doctorImgWrap}>
              <div style={s.speakingRing(isSpeaking)} />
              <img src="/doctor_avatar.png" alt="Dr. AI" style={s.doctorImg(isSpeaking)} />
            </div>
            <div style={s.doctorName}>Dr. AI Meena</div>
            <div style={s.doctorRole}>AI Consulting Doctor</div>
            <div style={s.doctorStatus(isSpeaking, recording)}>
              <div style={s.statusDot(status.color)} />
              {status.text}
            </div>
          </div>

          <div style={s.reportsList}>
            <div style={s.reportsTitle}><FiFileText size={11} /> Select a Report</div>
            {reports.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 12, padding: '8px 0' }}>No reports uploaded yet. Go to Upload page first.</p>
            ) : (
              reports.filter((r) => r.status === 'analyzed').map((r) => (
                <div key={r.id} style={s.reportItem(String(r.id) === String(selectedReport))}
                  onClick={() => { setSelectedReport(String(r.id)); setMessages([]); window.speechSynthesis?.cancel(); }}>
                  <FiFileText size={13} />
                  {r.filename}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right Panel: Conversation ── */}
        <div style={s.chatMain}>
          <div style={s.chatHeader}>
            <div style={s.chatTitle}>
              <FiActivity size={15} color="#0284c7" />
              Consultation
            </div>
            <div style={s.headerControls}>
              {isSpeaking && (
                <button style={s.stopBtn} onClick={stopSpeaking} title="Stop speaking">
                  ⏹ Stop
                </button>
              )}
              <button style={s.autoVoiceBtn(autoVoice)} onClick={() => setAutoVoice(!autoVoice)} title="Toggle auto voice reply">
                {autoVoice ? <FiVolume2 size={12} /> : <FiVolumeX size={12} />}
                {autoVoice ? 'Voice On' : 'Voice Off'}
              </button>
              <button style={s.langBtn(lang === 'en')} onClick={() => { setLang('en'); stopSpeaking(); }}>EN</button>
              <button style={s.langBtn(lang === 'te')} onClick={() => { setLang('te'); stopSpeaking(); }}>TE</button>
            </div>
          </div>

          <div style={s.msgList}>
            {!selectedReport ? (
              <div style={s.empty}>
                <img src="/doctor_avatar.png" alt="" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '3px solid #e2e8f0' }} />
                <div style={s.emptyTitle}>Hello! I'm Dr. AI Meena</div>
                <p style={{ fontSize: 13, maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
                  Please select one of your analyzed reports from the left panel. I'll review it and answer all your health questions.
                </p>
              </div>
            ) : messages.length === 0 && !loading ? (
              <div style={s.empty}>
                <img src="/doctor_avatar.png" alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, border: '3px solid #e2e8f0' }} />
                <div style={s.emptyTitle}>I've reviewed your report. Ask me anything!</div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Tap the mic to speak, or type below</p>
                <div style={s.suggestionsWrap}>
                  {SUGGESTIONS.map((sug, i) => (
                    <button key={i} style={s.suggestionBtn} onClick={() => sendMessage(sug)}>{sug}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} style={s.bubble(m.role === 'user')}>
                  <div style={s.avatar(m.role === 'user')}>
                    {m.role === 'user'
                      ? <FiUser size={14} color="#0284c7" />
                      : <img src="/doctor_avatar.png" alt="Dr." style={s.avatarImg} />
                    }
                  </div>
                  <div>
                    <div style={s.msgBubble(m.role === 'user')}>{m.text}</div>
                    {m.role === 'ai' && (
                      <button
                        style={s.speakSmallBtn}
                        onClick={() => isSpeaking ? stopSpeaking() : speakAnswer(m.text)}
                      >
                        {isSpeaking ? '⏹ Stop' : <><FiVolume2 size={10} /> Listen</>}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={s.bubble(false)}>
                <div style={s.avatar(false)}>
                  <img src="/doctor_avatar.png" alt="Dr." style={s.avatarImg} />
                </div>
                <div style={{ ...s.msgBubble(false), display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Dr. AI is reviewing your question...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar: Mic / Stop Speaking + Text + Send */}
          <div style={s.inputBar}>
            {isSpeaking ? (
              <button
                style={s.stopBarBtn}
                onClick={stopSpeaking}
                title="Stop the doctor from speaking"
              >
                ⏹
              </button>
            ) : (
              <button
                style={s.micBtn(recording)}
                onClick={recording ? stopRecording : startRecording}
                title={recording ? 'Stop listening' : 'Speak to the doctor'}
              >
                {recording ? <FiMicOff size={16} /> : <FiMic size={16} />}
              </button>
            )}
            <textarea
              style={s.textarea}
              rows={1}
              placeholder={
                isSpeaking ? 'Doctor is speaking — press ⏹ to stop...'
                : recording ? 'వింటున్నాను... మాట్లాడండి (Listening...)'
                : selectedReport ? 'Dr. AI కి మీ ప్రశ్న అడగండి... (Type your question)'
                : 'ముందుగా రిపోర్టు ఎంచుకోండి (Select a report first)'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!selectedReport || loading || recording || isSpeaking}
            />
            <button style={s.sendBtn} onClick={() => sendMessage()} disabled={!selectedReport || loading || !input.trim() || isSpeaking}>
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
