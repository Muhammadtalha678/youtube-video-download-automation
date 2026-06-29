import { useEffect, useState } from 'react'

export function AdSenseUnit() {
  const [isClient, setIsClient] = useState(false)

  // Yeh sirf browser/client par true hoga, server par nahi
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return // Agar server hai to ruk jao

    try {
      const adsbygoogle = (window as any).adsbygoogle || []
      if (adsbygoogle.length >= 0) {
        adsbygoogle.push({})
      }
    } catch (e) {
      console.error("AdSense error:", e)
    }
  }, [isClient])

  // Jab tak client load na ho, khali div rakho taake mismatch na ho
  if (!isClient) {
    return <div style={{ minHeight: '100px' }} />
  }

  return (
    <div style={{ display: 'block', overflow: 'hidden', backgroundColor: "lightseagreen", minHeight: '100px' }}>
      {/* Google AdSense ka <ins> tag */}
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6513926499048019"
        data-ad-slot="3988280221"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
