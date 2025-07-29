"use client"

import { useEffect, useRef } from "react"

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

declare global {
  interface Window {
    MathJax?: MathJaxGlobal 
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
      if (!window.MathJax) {
        const script = document.createElement("script")
        script.src = "https://polyfill.io/v3/polyfill.min.js?features=es6"
        document.head.appendChild(script)

        const mathJaxScript = document.createElement("script")
        mathJaxScript.id = "MathJax-script"
        mathJaxScript.async = true
        mathJaxScript.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"

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
      containerRef.current.innerHTML = content
      window.MathJax.typesetPromise([containerRef.current]).catch((err: unknown) => {
        console.error("MathJax rendering error:", err)
      })
    }
  }

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
