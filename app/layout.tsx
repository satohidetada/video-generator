import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdMax from "./AdMax";
import GoogleAnalytics from "./GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MP3と画像からMP4動画を作成（無料・インストール不要） | dhlemons",
  description:
    "音声ファイルと画像1枚を選ぶだけで、MP4動画を無料で作成できるWebツールです。ブラウザ内で処理が完結するため、ファイルはサーバーに送信されません。登録不要。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics />
        {children}
        <AdMax />
        <footer
          style={{
            marginTop: 60,
            padding: '24px 20px 40px',
            textAlign: 'center',
            fontSize: 13,
            opacity: 0.7,
          }}
        >
          <a href="/privacy" style={{ margin: '0 10px' }}>プライバシーポリシー</a>
          <a href="/terms" style={{ margin: '0 10px' }}>利用規約</a>
          <a href="/contact" style={{ margin: '0 10px' }}>お問い合わせ</a>
          <div style={{ marginTop: 12 }}>© dhlemons</div>
        </footer>
      </body>
    </html>
  );
}
