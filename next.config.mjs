/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // App Router はスクリプトを外部バンドルとして配信するため unsafe-inline 不要。
              // 開発時のみ unsafe-eval（HMR）と unsafe-inline を許可する。
              process.env.NODE_ENV === 'development'
                ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
                : "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",  // Tailwind インラインスタイルのため必要
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "object-src 'none'",   // プラグイン（Flash等）を完全禁止
              "base-uri 'self'",     // base タグインジェクション防止
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
