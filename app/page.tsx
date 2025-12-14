'use client'

import { useState, DragEvent } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

type DropZoneProps = {
  label: string
  accept: string
  file: File | null
  onFile: (file: File | null) => void
}

function DropZone({ label, accept, file, onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const hasError = !file

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={e => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${hasError ? '#e53935' : '#666'}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: dragging ? '#222' : '#111',
        color: '#fff',
        position: 'relative',
      }}
    >
      <div style={{ marginBottom: 10, fontWeight: 'bold' }}>{label}</div>

      <label
        style={{
          display: 'inline-block',
          padding: '10px 16px',
          background: '#1976d2',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        ファイルを選択
        <input
          type="file"
          accept={accept}
          hidden
          onChange={e => onFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85 }}>
        {file ? `選択中: ${file.name}` : '未選択'}
      </div>

      {dragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          ここにドロップしてください
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const generateVideo = async () => {
    if (!audio || !image) return

    setLoading(true)
    setVideoUrl(null)

    const ffmpeg = new FFmpeg()
    await ffmpeg.load()

    await ffmpeg.writeFile('audio.mp3', await fetchFile(audio))
    await ffmpeg.writeFile('image.png', await fetchFile(image))

    await ffmpeg.exec([
      '-loop', '1',
      '-i', 'image.png',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      'output.mp4',
    ])

    const data = await ffmpeg.readFile('output.mp4')

    const videoData =
      data instanceof Uint8Array
        ? data
        : new TextEncoder().encode(data)

    const url = URL.createObjectURL(
      new Blob([videoData], { type: 'video/mp4' })
    )

    setVideoUrl(url)
    setLoading(false)
  }

  return (
    <main
      style={{
        padding: 40,
        background: '#000',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      <h1>MP3 + 画像 → MP4 生成</h1>

      <DropZone
        label="① 音声ファイル（MP3など）"
        accept="audio/*"
        file={audio}
        onFile={setAudio}
      />

      <DropZone
        label="② 画像ファイル（PNG / JPG）"
        accept="image/*"
        file={image}
        onFile={setImage}
      />

      <button
        onClick={generateVideo}
        disabled={loading || !audio || !image}
        style={{
          padding: '12px 20px',
          fontSize: 16,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          background: loading || !audio || !image ? '#555' : '#43a047',
          color: '#fff',
        }}
      >
        {loading ? '生成中…' : '動画生成'}
      </button>

      {videoUrl && (
        <p style={{ marginTop: 20 }}>
          <a
            href={videoUrl}
            download="output.mp4"
            style={{ color: '#4fc3f7' }}
          >
            MP4をダウンロード
          </a>
        </p>
      )}
    </main>
  )
}
