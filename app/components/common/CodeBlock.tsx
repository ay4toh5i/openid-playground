import { useState, useEffect, useRef } from "react";
import { useComputedColorScheme } from "@mantine/core";
import type { Highlighter, BundledLanguage } from "shiki";

type SupportedLang = "json" | "yaml" | "javascript" | "typescript" | "bash" | "text";

// Singleton highlighter - created once, shared across all CodeBlock instances
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: ["json", "yaml", "javascript", "typescript", "bash"],
      }),
    );
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  code: string;
  lang?: SupportedLang;
  style?: React.CSSProperties;
}

export function CodeBlock({ code, lang = "text", style }: CodeBlockProps) {
  const colorScheme = useComputedColorScheme("light");
  const [html, setHtml] = useState<string>("");
  const codeRef = useRef(code);
  const langRef = useRef(lang);
  const schemeRef = useRef(colorScheme);

  useEffect(() => {
    codeRef.current = code;
    langRef.current = lang;
    schemeRef.current = colorScheme;

    if (lang === "text") {
      setHtml("");
      return;
    }

    // Async: load and use Shiki highlighter
    void getHighlighter().then((hl) => {
      // Only update if the inputs haven't changed since we started
      if (
        code === codeRef.current &&
        lang === langRef.current &&
        colorScheme === schemeRef.current
      ) {
        const theme = colorScheme === "dark" ? "github-dark" : "github-light";
        setHtml(hl.codeToHtml(code, { lang: lang as BundledLanguage, theme }));
      }
    });
  }, [code, lang, colorScheme]);

  const baseStyle: React.CSSProperties = {
    fontSize: "12px",
    lineHeight: 1.6,
    borderRadius: "4px",
    overflowX: "auto",
    margin: 0,
    ...style,
  };

  if (!html) {
    // Plain fallback while Shiki loads (or for "text" lang)
    return (
      <pre
        style={{
          ...baseStyle,
          padding: "12px",
          backgroundColor: colorScheme === "dark" ? "#24292e" : "#f6f8fa",
          color: colorScheme === "dark" ? "#e1e4e8" : "#24292e",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} style={baseStyle} className="shiki-block" />
  );
}
