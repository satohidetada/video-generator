'use client'

import { useState, DragEvent, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export default function Page() {
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([]) // ログ表示用
  
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-10), msg]) // 直近10行を表示
    console.log(msg)
  }

  const generateVideo = async () => {
    if (!audio || !image) return
    setLoading(true)
    setVideoUrl(null)
    setLogs(['処理を開始します...'])

    // セキュリティチェック
    if (!window.crossOriginIsolated) {
      addLog("❌ セキュリティヘッダー(COOP/COEP)が正しく設定されていません。")
    }

    if (!ffmpegRef.current) ffmpegRef.current = new FFmpeg()
    const ffmpeg = ffmpegRef.current

    // FFmpegのログをキャッチ
    ffmpeg.on('log', ({ message }) => addLog(`FFmpeg: ${message}`))

    try {
      if (!ffmpeg.loaded) {
        addLog("FFmpegコアをロード中...")
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      addLog("ファイルを書き込み中...")
      await ffmpeg.writeFile('audio.mp3', await fetchFile(audio))
      await ffmpeg.writeFile('image.png', await fetchFile(image))

      addLog("エンコード中 (時間がかかる場合があります)...")
      
      // 0KB回避のため、より確実なコマンドに変更
      await ffmpeg.exec([
        '-loop', '1',
        '-framerate', '1',    // 1秒1フレーム
        '-i', 'image.png',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',          // 音声の長さに合わせる
        '-fflags', '+shortest', // より厳格に長さを合わせる設定
        'output.mp4'
      ])

      addLog("読み込み中...")
      const data = await ffmpeg.readFile('output.mp4')
      
      if ((data as Uint8Array).length === 0) {
        addLog("❌ 失敗: 生成されたデータが0バイトです。")
      } else {
        addLog(`✅ 成功: ${((data as Uint8Array).length / 1024 / 1024).toFixed(2)} MB`)
        const blob = new Blob([data as any], { type: 'video/mp4' })
        setVideoUrl(URL.createObjectURL(blob))
      }

    } catch (error: any) {
      addLog(`❌ エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1>MP3 + 画像 → MP4 (Debug Mode)</h1>

        <div style={{ border: '1px solid #333', padding: 20, marginBottom: 20 }}>
          <p>音声: <input type="file" onChange={e => setAudio(e.target.files?.[0] || null)} /></p>
          <p>画像: <input type="file" onChange={e => setImage(e.target.files?.[0] || null)} /></p>
          <button 
            onClick={generateVideo} 
            disabled={loading}
            style={{ padding: '10px 20px', background: '#43a047', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            {loading ? '生成中...' : '動画を生成する'}
          </button>
        </div>

        <div style={{ background: '#111', padding: 15, borderRadius: 8, fontSize: '12px', border: '1px solid #444' }}>
          <strong>ステータスログ:</strong>
          {logs.map((l, i) => <div key={i} style={{ color: l.includes('❌') ? '#ff5252' : '#bbb' }}>{l}</div>)}
        </div>

        {videoUrl && (
          <div style={{ marginTop: 20 }}>
            <a href={videoUrl} download="output.mp4" style={{ color: '#4fc3f7', fontSize: '18px', fontWeight: 'bold' }}>
              📥 MP4をダウンロード
            </a>
          </div>
        )}
      </div>
    </main>
  )
}