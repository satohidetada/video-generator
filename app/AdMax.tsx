'use client'

import { useEffect, useState } from 'react'

const PC = {
  src: 'https://adm.shinobi.jp/s/7021f12f19dc21fce8c40e890fb56e8c',
  w: 300,
  h: 250,
}
const SP = {
  src: 'https://adm.shinobi.jp/s/2c5d0dc7ae117f6fff260f3d2323bf65',
  w: 320,
  h: 100,
}

export default function AdMax() {
  const [ad, setAd] = useState<typeof PC | null>(null)

  useEffect(() => {
    setAd(window.matchMedia('(max-width: 767px)').matches ? SP : PC)
  }, [])

  if (!ad) return <div style={{ minHeight: 120 }} />

  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>html,body{margin:0;padding:0;overflow:hidden}</style></head>' +
    '<body><script src="' + ad.src + '"><\/script></body></html>'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0 0' }}>
      <iframe
        srcDoc={html}
        width={ad.w}
        height={ad.h}
        scrolling="no"
        style={{ border: 0, display: 'block' }}
        title="広告"
      />
    </div>
  )
}
