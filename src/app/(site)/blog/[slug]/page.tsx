import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ClockIcon } from "@/components/ui/icons";
import { getPublishedPostBySlug } from "@/lib/content/blog";
import { getSiteSeo } from "@/lib/seo/public";
import { toAbsoluteUrl } from "@/lib/seo/types";
import { safeJsonLd } from "@/lib/seo/jsonld";
import { renderMarkdown } from "@/lib/blog/markdown";
import { formatPostDate, readTimeMinutes } from "@/lib/blog/format";
import { parseTags } from "@/lib/content/blog";
import { FooterData } from "@/components/sections/footer-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }

  const { baseUrl, name } = await getSiteSeo();
  const title = post.seoTitle.trim() || post.title;
  const description = post.seoDescription.trim() || post.excerpt;
  const url = `${baseUrl}/blog/${post.slug}`;
  const image = post.coverImage ? toAbsoluteUrl(post.coverImage, baseUrl) : "";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: name,
      type: "article",
      locale: "en_US",
      publishedTime: post.publishedAt ?? undefined,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) notFound();

  const { baseUrl, name } = await getSiteSeo();
  const url = `${baseUrl}/blog/${post.slug}`;
  const coverUrl = post.coverImage ? toAbsoluteUrl(post.coverImage, baseUrl) : "";
  const tags = parseTags(post.tags);

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle.trim() || post.title,
    description: post.seoDescription.trim() || post.excerpt,
    ...(coverUrl ? { image: coverUrl } : {}),
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author: post.author.trim()
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name },
    publisher: { "@type": "Organization", name },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(post.category.trim() ? { articleSection: post.category.trim() } : {}),
    keywords: post.tags.trim() || undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogPostingLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <article className="relative bg-[var(--blog-bg)] pb-24 pt-36 lg:pb-32 lg:pt-44">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
          >
            <ArrowLeftIcon size={14} />
            All stories
          </Link>

          <header className="mt-10">
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <span className="inline-flex items-center rounded-full border border-[var(--blog-chip-border)] bg-[var(--blog-chip-bg)] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
                  {post.category}
                </span>
              )}
              {post.featured && (
                <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#1a1a1a]">
                  Featured
                </span>
              )}
            </div>

            <h1
              className="mt-6 text-[clamp(2.1rem,4.5vw,3.2rem)] font-bold leading-[1.1] tracking-[0.01em] text-[var(--fg)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--blog-hr)] pb-6 text-[0.75rem] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              {post.author && <span>{post.author}</span>}
              <time dateTime={post.publishedAt ?? undefined}>
                {formatPostDate(post.publishedAt)}
              </time>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon size={12} />
                {readTimeMinutes(post.content)} min read
              </span>
            </div>
          </header>

          {coverUrl && (
            <div className="mt-10 overflow-hidden rounded-[24px] border border-[var(--blog-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt={post.title} className="aspect-[16/9] w-full object-cover" />
            </div>
          )}

          <div className="mt-12">
            {renderMarkdown(post.content)}
          </div>

          {tags.length > 0 && (
            <footer className="mt-14 border-t border-[var(--blog-hr)] pt-8">
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--blog-chip-border)] bg-[var(--blog-chip-bg)] px-3 py-1.5 text-[0.75rem] text-[var(--fg-soft)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </footer>
          )}

          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--blog-border)] bg-[var(--blog-card-bg)] px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[var(--fg)] shadow-[var(--blog-card-shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:text-[var(--accent)]"
            >
              <ArrowLeftIcon size={14} />
              Back to the blog
            </Link>
          </div>
        </div>
      </article>

      <FooterData />
    </main>
  );
}
