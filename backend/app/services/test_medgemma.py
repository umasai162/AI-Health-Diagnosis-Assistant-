from app.services.medgemma_service import analyze_report

def test_medgemma_analyze(monkeypatch):
    # Mocking _call_gemini to prevent real API calls in simple test
    import app.services.medgemma_service as md
    monkeypatch.setattr(md, "_call_gemini", lambda prompt: '{"summary": "Test Summary"}')
    
    sample_report = """
    Hemoglobin: 10.2 g/dL
    WBC: 12000 /uL
    Platelets: 240000 /uL
    """
    
    result = analyze_report(sample_report)
    assert "summary" in result
    assert result["summary"] == "Test Summary"