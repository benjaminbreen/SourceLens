// lib/docs.ts
// Client-side utility for parsing MDX content
// This approach doesn't use the Node.js file system

import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

import { getDocContentBySlug, getAllDocSlugs } from './doc-content';

export interface DocData {
  title: string;
  lastUpdated: string;
  content: MDXRemoteSerializeResult;
  [key: string]: any; // for extra frontmatter fields
}

export async function getDocBySlug(slug: string): Promise<DocData | null> {
  try {
    const raw = getDocContentBySlug(slug);

    if (!raw) {
      console.error(`Doc content not found for slug: ${slug}`);
      return null;
    }

    const { data, content: mdxContent } = matter(raw);

    const mdxSource = await serialize(mdxContent, {
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { properties: { className: ['anchor'] } }],
          rehypePrism,
        ],
        remarkPlugins: [remarkGfm],
      },
    });

    return {
      title: data.title || 'Untitled',
      lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0],
      content: mdxSource,
      ...data,
    };
  } catch (err) {
    console.error(`Error processing doc ${slug}:`, err);
    return null;
  }
}

export async function getAllDocs(): Promise<Array<{ slug: string } & DocData>> {
  const slugs = getAllDocSlugs();

  const docs = await Promise.all(
    slugs.map(async (slug) => {
      const doc = await getDocBySlug(slug);
      return doc ? { slug, ...doc } : null;
    })
  );

  return docs.filter(Boolean) as Array<{ slug: string } & DocData>;
}
