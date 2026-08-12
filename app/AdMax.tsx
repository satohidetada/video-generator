'use client'

import { useEffect, useState } from 'react'

const PC = { src: '/ad-pc.html', w: 300, h: 250 }
const SP = { src: '/ad-sp.html', w: 320, h: 100 }

export default function AdMax() {
  const [ad, setAd] = useState<typeof PC | null>(null)

  useEffect(() => {
    setAd(window.matchMedia('(max-width: 767px)').matches ? SP : PC)
  }, [])

  if (!ad) return <div style={{ minHeight: 120 }} />

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0 0' }}>
      <iframe
        src={ad.src}
        width={ad.w}
        height={ad.h}
        scrolling="no"
        style={{ border: 0, display: 'block' }}
        title="広告"
      />
    </div>
  )
}
