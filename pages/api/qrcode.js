export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    const { qrcode } = req.body

    if (!qrcode) {
      return res.status(400).json({ error: 'Missing qrcode parameter' })
    }

    try {
      // Validasi QRIS string
      if (!/^[0-9]+$/.test(qrcode)) {
        return res.status(400).json({ error: 'Invalid QRIS format - must contain only numbers' })
      }

      if (qrcode.length < 20) {
        return res.status(400).json({ error: 'QRIS string too short' })
      }

      // Decode QRIS (TLV parsing)
      const decoded = decodeQris(qrcode)

      return res.status(200).json({
        success: true,
        qrcode,
        decoded,
        length: qrcode.length,
        tagCount: Object.keys(decoded).length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function decodeQris(qris) {
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

  const result = {}
  let i = 0

  while (i < qris.length - 4) {
    const tag = qris.substring(i, i + 2)
    const lengthStr = qris.substring(i + 2, i + 4)
    const length = parseInt(lengthStr, 10)

    if (isNaN(length) || length <= 0 || i + 4 + length > qris.length) break

    const value = qris.substring(i + 4, i + 4 + length)
    result[tag] = {
      name: TLV_TAGS[tag] || 'Tag ' + tag,
      value: value,
      length: length
    }

    i += 4 + length
  }

  return result
}