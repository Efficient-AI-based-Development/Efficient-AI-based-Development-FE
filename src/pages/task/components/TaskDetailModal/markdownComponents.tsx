import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-lg font-bold mt-4 mb-3 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold mt-3 mb-2">{children}</h3>
  ),
  ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start text-sm">
      <span className="mr-2">-</span>
      <span>{children}</span>
    </li>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed my-2">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};
