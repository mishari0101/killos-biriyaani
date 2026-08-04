import type { Metadata } from "next";
import { PenLineIcon } from "@/components/ui/icons";
import { blogContent } from "@/lib/content/blog";
import { listPublicBlogs } from "@/lib/blog/service";
import { getSiteShareMeta } from "@/lib/seo/public";
import { PostCard } from "@/components/blog/post-card";
import { FooterData } from "@/components/sections/footer-data";

export async function generateMetadata(): Promise<Metadata> {
  const { baseUrl, name, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage } =
    await getSiteShareMeta();
  const url = `${baseUrl}/blog`;

  return {
    title: "Blog",
    description: blogContent.description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: name,
      type: "website",
      locale: "en_US",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await listPublicBlogs();

  return (
    <main>
      <section className="relative bg-[var(--blog-bg)] pb-24 pt-36 lg:pb-32 lg:pt-44">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <header className="text-center">
            <p className="text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]">
              {blogContent.eyebrow}
            </p>
            <h1
              className="mt-6 text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[0.01em] text-[var(--fg)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {blogContent.titleA}
              <em className="mt-1 block italic text-[var(--accent)]">{blogContent.titleB}</em>
            </h1>
            <p className="mx-auto mt-6 max-w-[56ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]">
              {blogContent.description}
            </p>
          </header>

          {posts.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-20 max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-card-bg)] text-[var(--accent)] shadow-[var(--blog-card-shadow)]">
                <PenLineIcon size={26} />
              </div>
              <h2
                className="mt-6 font-serif text-2xl font-semibold text-[var(--fg)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {blogContent.emptyTitle}
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--fg-soft)]">
                {blogContent.emptyDescription}
              </p>
            </div>
          )}
        </div>
      </section>

      <FooterData />
    </main>
  );
}
