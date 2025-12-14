'use client'

import { useState, DragEvent } from 'react'

export default function VideoGenerator() {
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('audio/')) setAudio(file)
      if (file.type.startsWith('image/')) setImage(file)
    })
  }

  const generateVideo = async () => {
    if (!audio || !image) return

    setLoading(true)
    setVideoUrl(null)

    // ffmpeg は Client で dynamic import
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { fetchFile } = await import('@ffmpeg/util')

    const ffmpeg = new FFmpeg()

    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
    })

    await ffmpeg.writeFile('audio.mp3', await fetchFile(audio))
    await ffmpeg.writeFile('image.png', await fetchFile(image))

    await ffmpeg.exec([
      '-loop', '1',
      '-i', 'image.png',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      'output.mp4',
    ])

    const data = await ffmpeg.readFile('output.mp4')

    // ✅ buffer を使わない（これが超重要）
    const blob = new Blob(
      [data instanceof Uint8Array ? data : new TextEncoder().encode(data)],
      { type: 'video/mp4' }
    )

    const url = URL.createObjectURL(blob)
    setVideoUrl(url)
    setLoading(false)
  }

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 40 }}>
      <h1>🎥 MP3 + 画像 → MP4</h1>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: '2px dashed #666',
          padding: 40,
          marginTop: 20,
          borderRadius: 8,
        }}
      >
        <p>ここに音声と画像をドラッグ＆ドロップ</p>

        <div style={{ marginTop: 10 }}>
          <input
            type="file"
            accept="audio/*"
            onChange={e => setAudio(e.target.files?.[0] ?? null)}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] ?? null)}
          />
        </div>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          {audio && <div>🎵 {audio.name}</div>}
          {image && <div>🖼 {image.name}</div>}
        </div>
      </div>

      <button
        onClick={generateVideo}
        disabled={!audio || !image || loading}
        style={{ marginTop: 20, padding: '10px 20px' }}
      >
        {loading ? '生成中…' : '動画生成'}
      </button>

      {videoUrl && (
        <p style={{ marginTop: 20 }}>
          <a href={videoUrl} download="output.mp4">
            ⬇ MP4をダウンロード
          </a>
        </p>
      )}
    </main>
  )
}
