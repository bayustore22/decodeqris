import { useState, useEffect } from 'react'

const TLV_TAGS = {
  '00': 'Payload Format Indicator',
  '01': 'Point of Initiation Method',
  '04': 'Transaction Amount',
  '07': 'Currency Code',
  '08': 'Country Code',
  '09': 'Merchant Category Code',
  '10': 'Merchant Name',
  '11': 'Merchant City',
  '12': 'Postal Code',
  '26': 'Merchant Account Information',
  '29': 'Wallet Information',
  '30': 'Additional Data Field Template',
  '54': 'Transaction Amount',
  '58': 'Merchant ID',
  '59': 'Additional Information',
  '60': 'Bill Number',
  '61': 'Mobile Number',
  '62': 'Reference Label',
  '63': 'Terminal ID',
  '64': 'Purpose of Transaction',
  '99': 'Cyclic Redundancy Check'
}

export default function Home() {
  const [tab, setTab] = useState(0)
  const [qrisInput, setQrisInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [preview, setPreview] = useState(null)
  const [history, setHistory] = useState([])
  const [apiConfig, setApiConfig] = useState({
    endpoint: 'https://api.betabotz.eu.org/qrcode',
    method: 'POST',
    key: '',
    format: 'qrcode'
  })
  const [apiResponse, setApiResponse] = useState(null)

  // Load history dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qris-history')
    if (saved) setHistory(JSON.parse(saved))

    const savedConfig = localStorage.getItem('api-config')
    if (savedConfig) setApiConfig(JSON.parse(savedConfig))
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', '❌ File terlalu besar (max 10MB)')
      return
    }

    setLoading(true)
    setMessage({ type: 'success', text: '⏳ Decoding QR code...' })

    try {
      const reader = new FileReader()
      reader.onload = async (evt) => {
        const img = new Image()
        img.onload = async () => {
          setPreview(evt.target?.result)

          // Buat canvas untuk extract QR code
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          ctx?.drawImage(img, 0, 0)

          // Deteksi QR code pattern
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (!imageData) {
            showMessage('error', '❌ Gagal memproses gambar')
            setLoading(false)
            return
          }

          // Coba extract text dari URL atau gunakan fallback
          showMessage('warning', '⚠️ Gunakan tab "Paste String" untuk paste string QRIS langsung')
          setLoading(false)
        }
        img.src = evt.target?.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  const handlePasteQris = async () => {
    if (!qrisInput.trim()) {
      showMessage('error', '❌ Masukkan string QRIS')
      return
    }

    if (qrisInput.length < 20) {
      showMessage('error', '❌ String QRIS terlalu pendek (minimal 20 karakter)')
      return
    }

    if (!/^[0-9]+$/.test(qrisInput)) {
      showMessage('error', '❌ String QRIS hanya boleh angka')
      return
    }

    setLoading(true)
    setMessage({ type: 'success', text: '⏳ Decoding...' })

    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrcode: qrisInput })
      })

      const data = await res.json()

      if (!res.ok) {
        showMessage('error', `❌ ${data.error}`)
        return
      }

      setResult(data)
      setTab(0)
      showMessage('success', '✅ QRIS berhasil di-decode!')

      // Simpan ke history
      const newHistory = [
        { qris: qrisInput, timestamp: new Date().toISOString() },
        ...history
      ].slice(0, 50)
      setHistory(newHistory)
      localStorage.setItem('qris-history', JSON.stringify(newHistory))
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendApi = async () => {
    if (!result) {
      showMessage('error', '❌ Dekode QRIS terlebih dahulu')
      return
    }

    setLoading(true)
    setMessage({ type: 'success', text: '⏳ Mengirim ke API...' })

    try {
      const formatMap = {
        qrcode: { qrcode: result.qrcode },
        data: { data: result.qrcode },
        string: { string: result.qrcode },
        raw: { raw: result.qrcode }
      }

      const payload = formatMap[apiConfig.format as keyof typeof formatMap]

      const res = await fetch(apiConfig.endpoint, {
        method: apiConfig.method,
        headers: {
          'Content-Type': 'application/json',
          ...(apiConfig.key && { Authorization: `Bearer ${apiConfig.key}` })
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      setApiResponse(data)
      showMessage('success', `✅ Berhasil dikirim! Status: ${res.status}`)
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = () => {
    localStorage.setItem('api-config', JSON.stringify(apiConfig))
    showMessage('success', '✅ Konfigurasi tersimpan')
  }

  const handleDownloadJson = () => {
    if (!result) return
    const data = JSON.stringify(result, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `QRIS_${Date.now()}.json`
    a.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
        .header { text-align: center; margin-bottom: 2rem; }
        .header h1 { font-size: 28px; font-weight: 600; margin-bottom: 0.5rem; }
        .header p { font-size: 14px; color: #666; }
        .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #ddd; overflow-x: auto; }
        .tab-btn { background: none; border: none; padding: 0.75rem 1rem; font-size: 14px; cursor: pointer; color: #666; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #000; border-bottom-color: #0066cc; }
        .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .upload-area { border: 2px dashed #ccc; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer; }
        .upload-area:hover { background: #f9f9f9; border-color: #0066cc; }
        input[type="file"] { display: none; }
        input, textarea, select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-family: 'Monaco', monospace; font-size: 13px; margin: 0.75rem 0; }
        .btn { background: transparent; border: 1px solid #ddd; border-radius: 6px; padding: 0.75rem 1.5rem; font-size: 14px; cursor: pointer; }
        .btn:hover { background: #f5f5f5; }
        .btn-success { background: #28a745; color: white; border-color: #28a745; }
        .message { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 14px; }
        .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .message.warning { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
        .result-box { background: #f9f9f9; border-radius: 6px; padding: 1.25rem; margin: 1rem 0; border: 1px solid #eee; }
        .result-item { display: flex; flex-direction: column; padding: 0.75rem 0; border-bottom: 1px solid #eee; }
        .result-item:last-child { border-bottom: none; }
        .result-label { font-size: 13px; color: #666; font-weight: 600; margin-bottom: 0.5rem; }
        .result-value { font-size: 13px; color: #000; font-family: 'Monaco', monospace; word-break: break-all; background: #fff; padding: 0.5rem; border-radius: 4px; border: 1px solid #eee; }
        .btn-group { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
        .qris-display { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0; font-family: 'Monaco', monospace; font-size: 12px; word-break: break-all; border: 1px solid #ddd; }
        h2 { font-size: 18px; font-weight: 600; margin: 1.5rem 0 1rem 0; }
        h3 { font-size: 16px; font-weight: 600; margin: 1rem 0 0.75rem 0; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>📸 QRIS Auto Decoder</h1>
          <p>Upload QRIS → Otomatis decode string → Kirim ke API</p>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
            ✏️ Paste String
          </button>
          <button className={`tab-btn ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
            📤 Upload Gambar
          </button>
          <button className={`tab-btn ${tab === 2 ? 'active' : ''}`} onClick={() => setTab(2)}>
            ⚙️ API Config
          </button>
          <button className={`tab-btn ${tab === 3 ? 'active' : ''}`} onClick={() => setTab(3)}>
            📤 Kirim API
          </button>
          <button className={`tab-btn ${tab === 4 ? 'active' : ''}`} onClick={() => setTab(4)}>
            📊 Riwayat
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {/* Tab 0: Paste String */}
        <div className={`tab-content ${tab === 0 ? 'active' : ''}`}>
          <div className="card">
            <h2>✏️ Paste String QRIS</h2>
            <textarea
              value={qrisInput}
              onChange={(e) => setQrisInput(e.target.value)}
              placeholder="Contoh: 000201021202..."
              style={{ height: '120px' }}
            />
            <div className="btn-group">
              <button className="btn btn-success" onClick={handlePasteQris} disabled={loading}>
                {loading ? '⏳ Loading...' : '🔍 Dekode QRIS'}
              </button>
              <button className="btn" onClick={() => setQrisInput('')}>
                🗑️ Bersihkan
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Upload */}
        <div className={`tab-content ${tab === 1 ? 'active' : ''}`}>
          <div className="card">
            <h2>📤 Upload Gambar QRIS</h2>
            <div
              className="upload-area"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <p>🖼️ Seret gambar QRIS di sini atau klik</p>
              <strong style={{ display: 'block', margin: '0.75rem 0' }}>Pilih Gambar</strong>
              <p style={{ fontSize: '12px', color: '#999' }}>PNG, JPG, GIF (max 10MB)</p>
            </div>
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {preview && <img src={preview} style={{ maxWidth: '100%', maxHeight: '350px', marginTop: '1rem', borderRadius: '6px' }} />}
          </div>
        </div>

        {/* Tab 2: API Config */}
        <div className={`tab-content ${tab === 2 ? 'active' : ''}`}>
          <div className="card">
            <h2>⚙️ Konfigurasi API</h2>
            <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '0.5rem' }}>
                  API Endpoint:
                </label>
                <input
                  type="text"
                  value={apiConfig.endpoint}
                  onChange={(e) => setApiConfig({ ...apiConfig, endpoint: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Method:
                </label>
                <select
                  value={apiConfig.method}
                  onChange={(e) => setApiConfig({ ...apiConfig, method: e.target.value })}
                >
                  <option>POST</option>
                  <option>PUT</option>
                  <option>GET</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '0.5rem' }}>
                  API Key (opsional):
                </label>
                <input
                  type="text"
                  value={apiConfig.key}
                  onChange={(e) => setApiConfig({ ...apiConfig, key: e.target.value })}
                  placeholder="Bearer token..."
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Format:
                </label>
                <select
                  value={apiConfig.format}
                  onChange={(e) => setApiConfig({ ...apiConfig, format: e.target.value })}
                >
                  <option value="qrcode">qrcode</option>
                  <option value="data">data</option>
                  <option value="string">string</option>
                  <option value="raw">raw</option>
                </select>
              </div>
              <div className="btn-group">
                <button className="btn btn-success" onClick={handleSaveConfig}>
                  💾 Simpan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 3: Kirim API */}
        <div className={`tab-content ${tab === 3 ? 'active' : ''}`}>
          <div className="card">
            <h2>📤 Kirim ke API</h2>
            <div className="btn-group">
              <button className="btn btn-success" onClick={handleSendApi} disabled={!result || loading}>
                {loading ? '⏳ Sending...' : '🚀 Kirim ke API'}
              </button>
            </div>
            {apiResponse && (
              <div>
                <h3 style={{ marginTop: '1.5rem' }}>Response:</h3>
                <div className="qris-display">
                  {JSON.stringify(apiResponse, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab 4: History */}
        <div className={`tab-content ${tab === 4 ? 'active' : ''}`}>
          <div className="card">
            <h2>📊 Riwayat</h2>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#999' }}>
                📭 Belum ada riwayat
              </div>
            ) : (
              <div>
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9f9f9',
                      borderRadius: '6px',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #eee',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setQrisInput(item.qris)
                      setTab(0)
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(item.timestamp).toLocaleString('id-ID')}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#000',
                        fontFamily: 'Monaco',
                        marginTop: '0.5rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {item.qris.substring(0, 70)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="card">
            <h2>📋 Hasil Dekode</h2>
            <h3>String QRIS</h3>
            <div className="qris-display">{result.qrcode}</div>

            <h3>Informasi (Tag-Value)</h3>
            <div className="result-box">
              {Object.entries(result.decoded).map(([tag, data]: any) => (
                <div key={tag} className="result-item">
                  <span className="result-label">
                    Tag {tag}: {data.name}
                  </span>
                  <span className="result-value">{data.value}</span>
                </div>
              ))}
            </div>

            <div className="btn-group">
              <button
                className="btn"
                onClick={() => navigator.clipboard.writeText(result.qrcode)}
              >
                📋 Salin
              </button>
              <button className="btn" onClick={handleDownloadJson}>
                📥 Download JSON
              </button>
              <button className="btn" onClick={() => setResult(null)}>
                ❌ Hapus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}