import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type KaTeXComponentProps = {
  mathExpression: string;
};

export function KaTeXComponent({ mathExpression }: KaTeXComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Process display mode math expressions ($$...$$)
      let processedContent = mathExpression.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
        try {
          const renderedFormula = katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
          });
          return `<div class="katex-display">${renderedFormula}</div>`;
        } catch (e) {
          console.error("KaTeX error:", e);
          return match; // Return the original match if rendering fails
        }
      });

      // Process inline math expressions ($...$)
      processedContent = processedContent.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (e) {
          console.error("KaTeX error:", e);
          return match; // Return the original match if rendering fails
        }
      });

      // Apply the processed content to the container
      containerRef.current.innerHTML = processedContent;
    } catch (e) {
      console.error("Error processing math expressions:", e);
      // Display original content if processing fails completely
      if (containerRef.current) {
        containerRef.current.textContent = mathExpression;
      }
    }
  }, [mathExpression]);

  return <div ref={containerRef} className="katex-content"></div>;
}
