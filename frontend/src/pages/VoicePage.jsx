import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import DisclaimerBanner from '../components/DisclaimerBanner';
import api from '../api/axios';
import { FiMic, FiMicOff, FiVolume2, FiActivity } from 'react-icons/fi';

const s = {
  center: { maxWidth: 640, margin: '0 auto', textAlign: 'center' },
  title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 },
  sub: { color: '#64748b', fontSize: 14, marginBottom: 32 },
  micWrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ring: (recording) => ({
    position: 'absolute',
    width: 140, height: 140,
    borderRadius: '50%',
    border: `2px solid ${recording ? '#ef4444' : '#6366f1'}`,
    opacity: recording ? 1 : 0.3,
    animation: recording ? 'pulse 1.2s ease-in-out infinite' : 'none',
  }),
  micBtn: (recording) => ({
    width: 100, height: 100, borderRadius: '50%',
    background: recording
      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: recording
      ? '0 8px 40px rgba(239,68,68,0.45)'
      : '0 8px 40px rgba(99,102,241,0.45)',
    transition: 'all 0.3s ease',
    position: 'relative', zIndex: 1,
  }),
  transcript: {
    background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'left',
    minHeight: 60,
  },
  transcriptLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 },
  transcriptText: { color: '#e2e8f0', fontSize: 14, lineHeight: 1.6 },
  answerBox: {
    background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 14, padding: '16px 20px', textAlign: 'left', marginBottom: 24,
  },
  answerText: { color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 },
  speakBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px',
    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 10, color: '#10b981', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
  },
  reportSelect: {
    width: '100%', padding: '12px 14px', marginBottom: 24,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f1f5f9', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  langToggle: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 },
  langBtn: (active) => ({
    padding: '8px 20px', borderRadius: 8,
    border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#818cf8' : '#64748b', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
  }),
  avatarWrap: {
    position: 'relative', width: 140, height: 140, margin: '0 auto 24px',
    borderRadius: '50%', padding: 4,
  },
  avatarImg: (speaking) => ({
    width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%',
    boxShadow: speaking ? '0 0 40px rgba(16,185,129,0.6)' : '0 8px 30px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease',
    border: `3px solid ${speaking ? '#10b981' : '#334155'}`,
  }),
  avatarRing: (speaking) => ({
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '50%', border: '2px solid #10b981',
    animation: speaking ? 'pulse 1.5s ease-in-out infinite' : 'none',
    opacity: speaking ? 1 : 0, pointerEvents: 'none',
  })
};

export default function VoicePage() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get('/reports/').then((r) => {
      const analyzed = (r.data.reports || []).filter((rpt) => rpt.status === 'analyzed');
      setReports(analyzed);
      if (analyzed.length) setSelectedReport(String(analyzed[0].id));
    }).catch(() => {});
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Your browser does not support Speech Recognition. Please use Chrome.');
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
      setTranscript(text);
      await sendQuestion(text);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const sendQuestion = async (question) => {
    if (!selectedReport || !question) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await api.post(`/chat/${selectedReport}`, { question, language: lang });
      setAnswer(res.data.answer);
      speakAnswer(res.data.answer);
    } catch {
      toast.error('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const speakAnswer = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'te' ? 'te-IN' : 'en-US';
    utter.rate = 0.9;
    
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utter);
  };

  return (
    <Layout>
      <div style={s.center} className="animate-in">
        <h1 style={s.title}>Voice Assistant</h1>
        <p style={s.sub}>Speak your question. AI will answer based on your uploaded report.</p>
        <DisclaimerBanner />

        {/* AI Doctor Avatar */}
        <div style={s.avatarWrap}>
          <div style={s.avatarRing(isSpeaking)} />
          <img src="/doctor_avatar.png" alt="AI Doctor" style={s.avatarImg(isSpeaking)} />
        </div>

        {/* Report Selector */}
        <select style={s.reportSelect} value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
          {reports.length === 0 && <option value="">No analyzed reports found</option>}
          {reports.map((r) => <option key={r.id} value={r.id}>{r.filename}</option>)}
        </select>

        {/* Language Toggle */}
        <div style={s.langToggle}>
          <button style={s.langBtn(lang === 'en')} onClick={() => setLang('en')}>🇺🇸 English</button>
          <button style={s.langBtn(lang === 'te')} onClick={() => setLang('te')}>🇮🇳 Telugu</button>
        </div>

        {/* Mic Button */}
        <div style={s.micWrap}>
          <div style={s.ring(recording)} />
          <div style={{ ...s.ring(recording), width: 120, height: 120, animationDelay: '0.3s' }} />
          <button style={s.micBtn(recording)} onClick={recording ? stopRecording : startRecording}>
            {recording ? <FiMicOff size={36} color="white" /> : <FiMic size={36} color="white" />}
          </button>
        </div>

        <p style={{ color: recording ? '#ef4444' : '#64748b', fontSize: 14, marginBottom: 32, fontWeight: recording ? 600 : 400 }}>
          {recording ? '🔴 Listening… Speak now' : 'Tap the microphone to ask a question'}
        </p>

        {/* Transcript */}
        {transcript && (
          <div style={s.transcript}>
            <div style={s.transcriptLabel}>You said</div>
            <div style={s.transcriptText}>"{transcript}"</div>
          </div>
        )}

        {/* Answer */}
        {loading && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 10 }}>Analyzing your question…</p>
          </div>
        )}

        {answer && (
          <div style={s.answerBox}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiActivity size={12} /> AI Response
            </div>
            <div style={s.answerText}>{answer}</div>
            <button style={{ ...s.speakBtn, marginTop: 12 }} onClick={() => speakAnswer(answer)}>
              <FiVolume2 size={15} /> Read aloud
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
