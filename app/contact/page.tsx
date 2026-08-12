const FORM_URL = 'https://forms.gle/XXXXXXXXXXXX'

export const metadata = {
  title: 'お問い合わせ | dhlemons',
  description: 'dhlemons へのお問い合わせはこちらから。',
}

export default function Contact() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', lineHeight: 1.9 }}>
      <h1>お問い合わせ</h1>

      <p>
        当サイトのツールに関するご質問、不具合のご報告、ご要望などは、
        以下のフォームよりご連絡ください。
      </p>

      <p style={{ margin: '32px 0' }}>
        <a
          href={FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#1976d2',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          お問い合わせフォームを開く
        </a>
      </p>

      <p>
        内容によっては返信までお時間をいただく場合、
        また返信を差し控える場合がございます。あらかじめご了承ください。
      </p>

      <p style={{ marginTop: 40 }}>運営者：satohidetada（dhlemons）</p>
      <p><a href="/">← トップページへ戻る</a></p>
    </main>
  )
}
