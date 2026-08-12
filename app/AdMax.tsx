'use client'

import { useEffect, useRef } from 'react'

const PC_TAG = 'https://adm.shinobi.jp/s/7021f12f19dc21fce8c40e890fb56e8c'
const SP_TAG = 'https://adm.shinobi.jp/s/2c5d0dc7ae117f6fff260f3d2323bf65'

export default function AdMax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current || !containerRef.current) return
    injected.current = true

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const script = document.createElement('script')
    script.src = isMobile ? SP_TAG : PC_TAG
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '40px 0 0',
        minHeight: 100,
      }}
    />
  )
}
