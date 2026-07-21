import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import DisclaimerBanner from '../components/DisclaimerBanner';
import api from '../api/axios';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';

const REPORT_TYPES = [
  'Blood Test Report', 'CBC Report', 'Prescription',
  'MRI Report', 'X-Ray Report', 'Lab Report', 'Health Report', 'Other',
];

const s = {
  title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 },
  sub: { color: '#64748b', fontSize: 14, marginBottom: 28 },
  dropzone: {
    border: '2px dashed rgba(99,102,241,0.4)',
    borderRadius: 16, padding: '60px 32px',
    textAlign: 'center',
    background: 'rgba(99,102,241,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 24,
    position: 'relative',
  },
  dropzoneActive: {
    borderColor: '#6366f1',
    background: 'rgba(99,102,241,0.1)',
  },
  dropIcon: { marginBottom: 16 },
  dropTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 },
  dropSub: { color: '#64748b', fontSize: 14 },
  filePreview: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 12, padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 20,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
  fileSize: { fontSize: 12, color: '#64748b', marginTop: 2 },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 },
  selectWrap: { marginBottom: 20 },
  selectLabel: { fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' },
  select: {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f1f5f9', fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  steps: { display: 'flex', gap: 8, marginBottom: 28 },
  step: {
    flex: 1, textAlign: 'center', padding: '10px 8px',
    borderRadius: 10, background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    fontSize: 12, color: '#64748b',
  },
  stepActive: { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' },
  stepNum: { fontSize: 16, fontWeight: 700, display: 'block', marginBottom: 2 },
  submitBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: 10, color: 'white',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
    transition: 'all 0.2s',
  },
  progress: { marginTop: 20, textAlign: 'center', color: '#94a3b8', fontSize: 14 },
};

function FileTag({ ext }) {
  const colors = { pdf: '#ef4444', png: '#3b82f6', jpg: '#10b981', jpeg: '#10b981' };
  return (
    <span style={{
      background: colors[ext] || '#6366f1', color: 'white',
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase',
    }}>{ext}</span>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('');
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | uploading | analyzing | done

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
      toast.error('Only PDF, PNG, JPG files are allowed.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB.');
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return toast.error('Please select a file.');
    setPhase('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const reportId = uploadRes.data.id;
      toast.success('Report uploaded! Starting AI analysis…');

      setPhase('analyzing');
      await api.post(`/ai/analyze/${reportId}`);
      toast.success('Analysis complete!');
      setPhase('done');
      setTimeout(() => navigate(`/analysis/${reportId}`), 800);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
      setPhase('idle');
    }
  };

  const phaseLabels = {
    idle: '1. Select', uploading: '2. OCR...', analyzing: '3. AI Analysis...', done: '4. Done ✓',
  };

  return (
    <Layout>
      <div className="animate-in">
        <h1 style={s.title}>Upload Medical Report</h1>
        <p style={s.sub}>Upload a PDF or image of your report. AI will analyze it instantly.</p>
        <DisclaimerBanner />

        {/* Progress Steps */}
        <div style={s.steps}>
          {Object.entries(phaseLabels).map(([key, label], i) => (
            <div key={key} style={{ ...s.step, ...(phase === key || (phase !== 'idle' && Object.keys(phaseLabels).indexOf(key) < Object.keys(phaseLabels).indexOf(phase)) ? s.stepActive : {}) }}>
              <span style={s.stepNum}>{i + 1}</span>
              {label.replace(/^\d+\. /, '')}
            </div>
          ))}
        </div>

        {/* Drop Zone */}
        {!file && (
          <div
            style={{ ...s.dropzone, ...(dragging ? s.dropzoneActive : {}) }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])} />
            <FiUploadCloud size={52} color="#6366f1" style={s.dropIcon} />
            <div style={s.dropTitle}>Drop your report here</div>
            <p style={s.dropSub}>or click to browse · PDF, PNG, JPG, JPEG · Max 10 MB</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
              {['pdf', 'png', 'jpg', 'jpeg'].map((e) => <FileTag key={e} ext={e} />)}
            </div>
          </div>
        )}

        {/* File Preview */}
        {file && (
          <div style={s.filePreview}>
            <FiFile size={24} color="#10b981" />
            <div style={s.fileInfo}>
              <div style={s.fileName}>{file.name}</div>
              <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB · <FileTag ext={file.name.split('.').pop().toLowerCase()} /></div>
            </div>
            {phase === 'idle' && (
              <button style={s.removeBtn} onClick={() => setFile(null)}><FiX size={18} /></button>
            )}
          </div>
        )}

        {/* Report Type */}
        <div style={s.selectWrap}>
          <label style={s.selectLabel}>Report Type (optional)</label>
          <select style={s.select} value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="">Auto-detect from content</option>
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button style={s.submitBtn} onClick={handleSubmit}
          disabled={!file || phase !== 'idle'}>
          {phase === 'idle' && <><FiUploadCloud size={18} /> Upload & Analyze</>}
          {phase === 'uploading' && <><span className="spinner" /> Uploading & OCR…</>}
          {phase === 'analyzing' && <><span className="spinner" /> AI Analyzing…</>}
          {phase === 'done' && <><FiCheckCircle size={18} /> Done! Redirecting…</>}
        </button>

        {(phase === 'uploading' || phase === 'analyzing') && (
          <div style={s.progress}>
            {phase === 'uploading' ? '🔍 Extracting text from your report…' : '🧠 Running AI analysis with RAG pipeline…'}
          </div>
        )}
      </div>
    </Layout>
  );
}
