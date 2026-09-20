/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // `standalone` gera .next/standalone com um server.js auto-contido.
  // E o formato ideal para rodar na VPS da Hostinger sob PM2:
  //   npm run build && node .next/standalone/server.js
  output: 'standalone',

  images: {
    remotePatterns: [
      // Avatares e capas vindas do Supabase Storage / S3.
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },

  experimental: {
    serverActions: {
      // Upload de PDF/DOCX pelas Server Actions: o default do Next e 1MB.
      bodySizeLimit: '25mb',
    },
  },

  // pdf-parse e mammoth sao pacotes Node puros: nao devem ser empacotados
  // pelo bundler do servidor.
  serverExternalPackages: ['pdf-parse', 'mammoth'],
}

export default nextConfig
