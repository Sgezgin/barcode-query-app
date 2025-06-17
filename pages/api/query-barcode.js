// API route to handle barcode queries
export default async function handler(req, res) {
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      const { carrierLabel } = req.body;
  
      if (!carrierLabel || carrierLabel.length !== 20) {
        return res.status(400).json({ 
          message: 'Carrier label must be exactly 20 characters long' 
        });
      }
  
      // API credentials
      const username = 'PTSUser92112';
      const password = 'PsT12+aX1127y';
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
      // Make request to external API
      const response = await fetch('https://einvoice.alliance-healthcare.com.tr/PTS_Proxy/api/getbarcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({ CarrierLabel: carrierLabel })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      res.status(200).json({
        success: true,
        carrierLabel,
        barcodes: data.Barcodes || [],
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({
        success: false,
        carrierLabel: req.body?.carrierLabel || '',
        barcodes: [],
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }