import { FiAlertTriangle } from 'react-icons/fi';

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer" style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <FiAlertTriangle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
      <span>
        <strong>Medical Disclaimer:</strong> This analysis is for informational purposes only and does not
        constitute a medical diagnosis. Always consult a qualified healthcare professional for medical advice,
        diagnosis, and treatment.
      </span>
    </div>
  );
}
