import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import DisclaimerBanner from '../components/DisclaimerBanner';
import api from '../api/axios';
import {
  FiAlertTriangle, FiCheckCircle, FiList, FiHeart,
  FiActivity, FiBookOpen, FiMessageSquare, FiGlobe,
  FiVolume2, FiVolumeX
} from 'react-icons/fi';

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 800, color: '#f1f5f9' },
  langToggle: { display: 'flex', gap: 8 },
  langBtn: (active) => ({
    padding: '8px 18px', borderRadius: 8, border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#818cf8' : '#64748b', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
  }),
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  card: (color) => ({
    background: `rgba(${color},0.07)`,
    border: `1px solid rgba(${color},0.2)`,
    borderRadius: 14, padding: '18px 20px',
  }),
  cardTitle: (color) => ({
    fontSize: 13, fontWeight: 700, color: `rgb(${color})`,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 6,
  }),
  pill: (color) => ({
    display: 'inline-block', margin: '3px',
    padding: '4px 12px', borderRadius: 20,
    background: `rgba(${color},0.15)`, color: `rgb(${color})`,
    fontSize: 12, fontWeight: 600,
  }),
  summaryCard: {
    background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14, padding: '20px 24px', marginBottom: 16,
  },
  summaryText: { color: '#cbd5e1', fontSize: 15, lineHeight: 1.7 },
  emergencyBanner: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: 12, padding: '14px 18px', marginBottom: 20,
    display: 'flex', gap: 12, alignItems: 'center', color: '#fca5a5', fontWeight: 600,
  },
  chatBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    border: 'none', borderRadius: 10, color: 'white',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    textDecoration: 'none', marginTop: 8,
    boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
  },
  ocrBox: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: 16, maxHeight: 200, overflowY: 'auto',
    fontSize: 12, color: '#64748b', lineHeight: 1.6, fontFamily: 'monospace',
  },
};

const C = { red: '239,68,68', green: '16,185,129', amber: '245,158,11', blue: '59,130,246', purple: '139,92,246', teal: '20,184,166' };

function ListCard({ title, icon: Icon, items, color }) {
  if (!items?.length) return null;
  return (
    <div style={s.card(color)}>
      <div style={s.cardTitle(color)}><Icon size={14} />{title}</div>
      <div>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: `rgb(${color})`, marginTop: 2, fontSize: 12 }}>•</span>
            <span style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [report, setReport] = useState(null);
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [showOcr, setShowOcr] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rpt, ana] = await Promise.all([
          api.get(`/reports/${reportId}`),
          api.get(`/ai/analysis/${reportId}`),
        ]);
        setReport(rpt.data);
        setAnalysis(ana.data);
      } catch {
        toast.error('Analysis not found. Triggering analysis…');
        try {
          await api.post(`/ai/analyze/${reportId}`);
          const ana = await api.get(`/ai/analysis/${reportId}`);
          setAnalysis(ana.data);
        } catch (e) {
          toast.error('Analysis failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [reportId]);

  if (loading) return <Layout><div style={{ textAlign: 'center', paddingTop: 80 }}><span className="spinner" style={{ width: 40, height: 40 }} /></div></Layout>;
  if (!analysis) return <Layout><div style={{ color: '#64748b', textAlign: 'center', paddingTop: 80 }}>No analysis found.</div></Layout>;

  const mainText = lang === 'te' ? analysis.telugu_response : analysis.english_response;

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (!mainText) return;
      const msg = new SpeechSynthesisUtterance(mainText);
      // For Telugu, 'te-IN' is the standard locale code
      msg.lang = lang === 'te' ? 'te-IN' : 'en-US';
      msg.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(msg);
      setIsPlaying(true);
    }
  };

  return (
    <Layout>
      <div className="animate-in">
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Analysis Results</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{report?.filename}</p>
          </div>
          <div style={s.langToggle}>
            <button style={s.langBtn(lang === 'en')} onClick={() => { setLang('en'); window.speechSynthesis.cancel(); setIsPlaying(false); }}>🇺🇸 English</button>
            <button style={s.langBtn(lang === 'te')} onClick={() => { setLang('te'); window.speechSynthesis.cancel(); setIsPlaying(false); }}>🇮🇳 Telugu</button>
          </div>
        </div>

        <DisclaimerBanner />

        {/* Emergency */}
        {analysis.emergency && (
          <div style={s.emergencyBanner}>
            <FiAlertTriangle size={20} color="#ef4444" />
            ⚠️ URGENT: This report may indicate a medical emergency. Please seek immediate medical attention!
          </div>
        )}

        {/* Summary */}
        <div style={s.summaryCard}>
          <div style={{ ...s.cardTitle(C.blue), marginBottom: 12, fontSize: 14 }}><FiBookOpen size={15} /> Summary</div>
          <div style={s.summaryText}>{analysis.summary}</div>
        </div>

        {/* Grid 1: Abnormal + Conditions */}
        <div style={s.grid}>
          <ListCard title="Abnormal Values" icon={FiAlertTriangle} items={analysis.abnormal_values} color={C.red} />
          <ListCard title="Possible Conditions" icon={FiActivity} items={analysis.possible_conditions} color={C.amber} />
        </div>

        {/* Grid 2: Diet + Lifestyle */}
        <div style={s.grid}>
          <ListCard title="Diet Plan" icon={FiHeart} items={analysis.diet_plan} color={C.green} />
          <ListCard title="Lifestyle Improvements" icon={FiCheckCircle} items={analysis.lifestyle} color={C.teal} />
        </div>

        {/* Grid 3: Follow-up + Doctor */}
        <div style={s.grid}>
          <ListCard title="Follow-Up Tests" icon={FiList} items={analysis.follow_up_tests} color={C.purple} />
          <div style={s.card(C.blue)}>
            <div style={s.cardTitle(C.blue)}><FiActivity size={14} /> Doctor Advice</div>
            <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{analysis.doctor_advice}</p>
          </div>
        </div>

        {/* Full Explanation */}
        {mainText && (
          <div style={s.summaryCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ ...s.cardTitle(C.purple), marginBottom: 0, fontSize: 14 }}>
                <FiGlobe size={15} /> {lang === 'te' ? 'తెలుగు వివరణ' : 'Detailed Explanation'}
              </div>
              <button 
                onClick={toggleSpeech}
                style={{
                  background: isPlaying ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                  border: 'none', borderRadius: 8, padding: '6px 12px',
                  color: isPlaying ? '#ef4444' : '#818cf8',
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {isPlaying ? <><FiVolumeX size={14} /> Stop Reading</> : <><FiVolume2 size={14} /> Read Aloud</>}
              </button>
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{mainText}</div>
          </div>
        )}

        {/* OCR Text */}
        {report?.ocr_text && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setShowOcr(!showOcr)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, padding: 0 }}>
              {showOcr ? '▲ Hide' : '▼ Show'} extracted OCR text
            </button>
            {showOcr && <div style={s.ocrBox}>{report.ocr_text}</div>}
          </div>
        )}

        {/* Chat CTA */}
        <Link to={`/chat?reportId=${reportId}`} style={s.chatBtn}>
          <FiMessageSquare size={16} /> Consult with AI Doctor
        </Link>
      </div>
    </Layout>
  );
}
