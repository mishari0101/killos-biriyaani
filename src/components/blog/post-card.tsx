import Link from "next/link";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/icons";
import { parseTags, type BlogPost } from "@/lib/content/blog";
import { formatPostDate, readTimeMinutes } from "@/lib/blog/format";

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  const tags = parseTags(post.tags).slice(0, 2);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--blog-border)] bg-[var(--blog-card-bg)] shadow-[var(--blog-card-shadow)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[var(--blog-card-shadow-hover)]">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col" aria-label={post.title}>
        <div className="relative aspect-[16/9] overflow-hidden">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--blog-chip-bg)]">
              <span
                className="text-5xl italic text-[var(--accent)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                K
              </span>
            </div>
          )}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            {post.featured && (
              <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#1a1a1a] shadow-[0_8px_20px_-8px_var(--shadow-color)]">
                Featured
              </span>
            )}
            {post.category && (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
                {post.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            {post.author && <span>{post.author}</span>}
            <time dateTime={post.publishedAt ?? undefined}>
              {formatPostDate(post.publishedAt)}
            </time>
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={11} />
              {readTimeMinutes(post.content)} min read
            </span>
          </div>

          <h3
            className="mt-3 text-[1.3rem] font-bold leading-snug text-[var(--fg)] transition-colors duration-300 group-hover:text-[var(--accent)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {post.title}
          </h3>

          <p className="mt-2.5 line-clamp-3 text-[0.92rem] font-light leading-[1.75] text-[var(--fg-soft)]">
            {post.excerpt}
          </p>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--blog-chip-border)] bg-[var(--blog-chip-bg)] px-2.5 py-1 text-[0.68rem] text-[var(--fg-soft)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Read story
            <ArrowRightIcon
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
