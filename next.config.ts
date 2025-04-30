const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [
      require('rehype-slug'),
      require('rehype-autolink-headings'),
      require('rehype-prism-plus'),
    ],
    providerImportSource: "@mdx-js/react",
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Add pageExtensions for MDX
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  images: {
    /*  All fixed hosts may stay in images.domains **or** in
        remotePatterns; mixing is fine.  */
    remotePatterns: [
      /* Supabase Storage – works for
         …/object/public/…  and  …/object/sign/…          */
      {
        protocol: 'https',
        // Automatically resolves to "<project-ref>.supabase.co"
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : '**.supabase.co',            // local‑dev / fallback
        pathname: '/storage/v1/object/**',
      },
      /* anything else you already allow */
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
    ],
  },
};

// Merge MDX config with Next.js config
module.exports = withMDX(nextConfig);