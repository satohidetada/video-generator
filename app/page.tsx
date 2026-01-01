'use client'

import { useState, DragEvent, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

// --- ドロップゾーン・コンポーネント (変更なし) ---
type DropZoneProps = {
  label: string
  accept: string
  file: File | null
  onFile: (file: File | null) => void
}

function DropZone({ label, accept, file, onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${file ? '#4caf50' : '#e53935'}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: dragging ? '#222' : '#111',
        color: '#fff',
        position: 'relative',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: 10, fontWeight: 'bold' }}>{label}</div>
      <label style={{
        display: 'inline-block',
        padding: '10px 16px',
        background: '#1976d2',
        borderRadius: 6,
        cursor: 'pointer',
      }}>
        ファイルを選択
        <input type="file" accept={accept} hidden onChange={e => onFile(e.target.files?.[0] ?? null)} />
      </label>
      <div style={{ marginTop: 10, fontSize: 14 }}>
        {file ? `選択中: ${file.name}` : '未選択'}
      </div>
    </div>
  )
}

// --- メインページ ---
export default function Page() {
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('output.mp4')
  
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const generateVideo = async () => {
    if (!audio || !image) return

    setLoading(true)
    setVideoUrl(null)

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg()
    }
    const ffmpeg = ffmpegRef.current

    try {
      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      ffmpeg.on('log', ({ message }) => console.log(message))

      await ffmpeg.writeFile('audio.mp3', await fetchFile(audio))
      await ffmpeg.writeFile('image.png', await fetchFile(image))

      await ffmpeg.exec([
        '-loop', '1',
        '-i', 'image.png',
        '-i', 'audio.mp3',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac', 
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        'output.mp4',
      ])

      const data = await ffmpeg.readFile('output.mp4')
      
      if ((data as Uint8Array).length === 0) {
        throw new Error('FFmpeg output is empty.')
      }

      const blob = new Blob([data as any], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)

    } catch (error) {
      console.error('FFmpeg Error:', error)
      alert('動画生成に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const getDownloadName = () => {
    let name = fileName.trim() || 'output'
    name = name.replace(/[\/\\:*?"<>|]/g, '')
    return name.toLowerCase().endsWith('.mp4') ? name : `${name}.mp4`
  }

  return (
    <main style={{ padding: 40, background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>MP3 + 画像 → MP4</h1>

        <DropZone label="① 音声ファイル" accept="audio/*" file={audio} onFile={setAudio} />
        <DropZone label="② 画像ファイル" accept="image/*" file={image} onFile={setImage} />

        <button
          onClick={generateVideo}
          disabled={!audio || !image || loading}
          style={{
            width: '100%', padding: '12px 20px', fontSize: 16, borderRadius: 8,
            background: loading ? '#555' : '#43a047', color: '#fff', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '生成中…' : '動画生成'}
        </button>

        {videoUrl && (
          <div style={{ marginTop: 30, textAlign: 'center', background: '#111', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
            <div style={{ marginBottom: 10, fontSize: 14, color: '#bbb' }}>保存ファイル名</div>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="ファイル名を入力"
              style={{ 
                marginBottom: 20, 
                padding: '12px', 
                borderRadius: 6, 
                width: '100%', 
                boxSizing: 'border-box',
                background: '#fff',   // 背景を白に
                color: '#000',        // 文字を黒に
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            />
            <br />
            <a href={videoUrl} download={getDownloadName()} style={{ 
              display: 'block',
              color: '#000', 
              background: '#4fc3f7', 
              padding: '14px 20px', 
              borderRadius: 8, 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              📥 MP4をダウンロード
            </a>
          </div>
        )}
      </div>
    </main>
  )
}