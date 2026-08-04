import type { ReactNode } from "react";

/**
 * Minimal, safe markdown renderer used by both the public article page
 * (Server Component) and the admin preview (Client Component).
 *
 * Only a safe subset is supported — headings, paragraphs, lists, blockquotes,
 * fenced code blocks, horizontal rules and inline bold/italic/code/links. All
 * HTML is escaped, so raw markup can never be injected into the page.
 */

const HREF_RE = /^(https?:\/\/|mailto:|tel:|#|\/)/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Parse inline formatting: `code`, **bold**, *italic* and [links](url). */
function parseInline(source: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) nodes.push(source.slice(last, match.index));

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code key={key++} className="rounded bg-[var(--blog-code-bg)] px-1.5 py-0.5 text-[0.85em] text-[var(--blog-code-fg)]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-[var(--fg)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      const label = link?.[1] ?? token;
      const href = link?.[2] ?? "";
      if (link && HREF_RE.test(href)) {
        const isExternal = /^https?:/i.test(href);
        nodes.push(
          <a
            key={key++}
            href={href}
            className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-4 transition-colors hover:text-[var(--accent-strong)]"
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>
        );
      } else {
        nodes.push(label);
      }
    }
    last = match.index + token.length;
  }

  if (last < source.length) nodes.push(source.slice(last));
  return nodes;
}

type Block =
  | { type: "code"; content: string }
  | { type: "heading"; level: number; content: string }
  | { type: "quote"; content: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "hr" }
  | { type: "paragraph"; content: string };

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const content: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        content.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push({ type: "code", content: content.join("\n") });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, content: heading[2] });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const content: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        content.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", content: content.join(" ") });
      continue;
    }

    const ul = /^[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+(.*)$/.exec(lines[i])) {
        items.push(/^[-*+]\s+(.*)$/.exec(lines[i])![1]);
        i += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+(.*)$/.exec(lines[i])) {
        items.push(/^\d+\.\s+(.*)$/.exec(lines[i])![1]);
        i += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^```/.test(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", content: paragraph.join(" ") });
  }

  return blocks;
}

/** Render a markdown string into React elements (safe — never raw HTML). */
export function renderMarkdown(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = parseBlocks(lines);

  return blocks.map((block, index) => {
    const key = `${index}-${block.type}`;

    switch (block.type) {
      case "code":
        return (
          <pre
            key={key}
            className="overflow-x-auto rounded-2xl border border-[var(--blog-code-border)] bg-[var(--blog-code-bg)] p-5 text-[0.85rem] leading-relaxed text-[var(--blog-code-fg)]"
          >
            <code>{escapeHtml(block.content)}</code>
          </pre>
        );
      case "heading": {
        // The page h1 is the article title, so markdown `#`..`######` map to
        // h2..h6. This keeps exactly one h1 per article (SEO/accessibility).
        const Heading = `h${Math.min(block.level + 1, 6)}` as "h2";
        const style = {
          h1: "text-[1.9rem] sm:text-[2.2rem]",
          h2: "text-[1.55rem] sm:text-[1.8rem]",
          h3: "text-[1.25rem] sm:text-[1.4rem]",
          h4: "text-[1.1rem] sm:text-[1.2rem]",
        }[block.level] ?? "text-[1.05rem] font-semibold";
        return (
          <Heading
            key={key}
            className={`mt-10 scroll-mt-28 font-bold leading-snug text-[var(--fg)] first:mt-0 ${style}`}
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {parseInline(block.content)}
          </Heading>
        );
      }
      case "quote":
        return (
          <blockquote
            key={key}
            className="my-7 rounded-r-2xl border-l-4 border-[var(--accent)] bg-[var(--blog-quote-bg)] px-6 py-5 italic leading-relaxed text-[var(--fg-soft)]"
          >
            {parseInline(block.content)}
          </blockquote>
        );
      case "list":
        return block.ordered ? (
          <ol key={key} className="my-6 list-decimal space-y-2 pl-6 text-[0.98rem] leading-[1.8] text-[var(--fg-soft)]">
            {block.items.map((item, i) => (
              <li key={i}>{parseInline(item)}</li>
            ))}
          </ol>
        ) : (
          <ul key={key} className="my-6 list-disc space-y-2 pl-6 text-[0.98rem] leading-[1.8] text-[var(--fg-soft)]">
            {block.items.map((item, i) => (
              <li key={i}>{parseInline(item)}</li>
            ))}
          </ul>
        );
      case "hr":
        return <hr key={key} className="my-9 border-0 border-t border-[var(--blog-hr)]" />;
      case "paragraph":
        return (
          <p key={key} className="my-6 text-[0.98rem] leading-[1.9] text-[var(--fg-soft)] first:mt-0">
            {parseInline(block.content)}
          </p>
        );
    }
  });
}
