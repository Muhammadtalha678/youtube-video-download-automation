import { useEffect } from 'react'

export function AdSenseUnit() {
  useEffect(() => {
    try {
      // Yeh code har dafa page load hone par ad ko push karega
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (e) {
      console.error("AdSense error:", e)
    }
  }, [])

  return (
    <div style={{ display: 'block', overflow: 'hidden' ,backgroundColor:"red"}}>
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
