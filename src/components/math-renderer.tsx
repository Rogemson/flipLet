"use client"

import { useEffect, useRef } from "react"

// Define a more specific type for MathJax global object
interface MathJaxGlobal {
  typesetPromise: (elements: HTMLElement[]) => Promise<void>
  tex?: {
    inlineMath?: string[][]
    displayMath?: string[][]
  }
  options?: {
    skipHtmlTags?: string[]
  }
}

// Extend window type for MathJax
declare global {
  interface Window {
    MathJax?: MathJaxGlobal // Make it optional as it might not be loaded yet
  }
}

interface MathRendererProps {
  content: string
  className?: string
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      // Load MathJax if not already loaded
      if (!window.MathJax) {
        const script = document.createElement("script")
        script.src = "https://polyfill.io/v3/polyfill.min.js?features=es6"
        document.head.appendChild(script)

        const mathJaxScript = document.createElement("script")
        mathJaxScript.id = "MathJax-script"
        mathJaxScript.async = true
        mathJaxScript.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"

        // Configure MathJax
        const mathJaxConfig = document.createElement("script")
        mathJaxConfig.type = "text/x-mathjax-config"
        mathJaxConfig.text = `
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$'], ['\\\$$', '\\\$$']],
              displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
          };
        `

        document.head.appendChild(mathJaxConfig)
        document.head.appendChild(mathJaxScript)

        mathJaxScript.onload = () => {
          renderMath()
        }
      } else {
        renderMath()
      }
    }
  }, [content])

  const renderMath = () => {
    if (window.MathJax && containerRef.current) {
      // Set the content
      containerRef.current.innerHTML = content

      // Re-render math
      window.MathJax.typesetPromise([containerRef.current]).catch((err: unknown) => {
        // Use unknown for error type and log it
        console.error("MathJax rendering error:", err)
      })
    }
  }

  // Fallback rendering without MathJax (for initial render or if MathJax fails to load)
  const renderFallback = () => {
    return content
      .replace(/\$\$(.*?)\$\$/g, '<span class="math-display">$1</span>')
      .replace(/\$(.*?)\$/g, '<span class="math-inline">$1</span>')
  }

  return (
    <div
      ref={containerRef}
      className={`math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderFallback() }}
    />
  )
}
