import type { Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export const chatRehypePlugins = [
  rehypeSanitize,
  [rehypeHighlight, { detect: true }] as [typeof rehypeHighlight, { detect: boolean }],
];

export const chatRemarkPlugins = [remarkGfm, remarkBreaks];

export const chatMarkdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-gpt-green hover:underline break-all"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="mt-4 mb-2 text-lg font-semibold text-white first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mt-4 mb-2 text-base font-semibold text-white first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold text-white first:mt-0" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-3 mb-1 text-sm font-semibold text-white/95 first:mt-0" {...props}>
      {children}
    </h4>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-3 border-l-2 border-white/25 pl-4 text-white/80 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => <hr className="my-4 border-white/10" {...props} />,
  ul: ({ children, ...props }) => (
    <ul className="my-2 list-disc space-y-1 pl-6 text-white/90" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 list-decimal space-y-1 pl-6 text-white/90" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed [&>p]:my-1" {...props}>
      {children}
    </li>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[20rem] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-white/[0.06]" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-white/15 px-3 py-2 text-left font-semibold text-white"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border-b border-white/10 px-3 py-2 align-top text-white/85"
      {...props}
    >
      {children}
    </td>
  ),
  tr: (props) => <tr className="even:bg-white/[0.02]" {...props} />,
  pre: ({ children, ...props }) => (
    <pre
      className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#0d1117]/90"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock =
      Boolean(className?.includes("language-")) || Boolean(className?.includes("hljs"));
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-white/95"
        {...props}
      >
        {children}
      </code>
    );
  },
  p: ({ children, ...props }) => (
    <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-white/90" {...props}>
      {children}
    </em>
  ),
  del: ({ children, ...props }) => (
    <del className="text-white/50 line-through" {...props}>
      {children}
    </del>
  ),
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="my-3 max-h-96 max-w-full rounded-lg border border-white/10"
      {...props}
    />
  ),
};
