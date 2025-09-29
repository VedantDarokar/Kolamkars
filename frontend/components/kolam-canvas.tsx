"use client"

import { useEffect, useRef } from "react"

interface KolamCanvasProps {
  parameters: {
    gridType: string
    rows: number
    columns: number
    dotSpacing: number
    strokeType: string
    symmetryType: string
    iterations: number
    animationSpeed?: number;
    strokeColor?: string;
    backgroundColor?: string;
    designType?: string;
  }
  kolamSvg: string | null;
  selectedSegmentId: string | null;
  onSegmentClick: (id: string | null) => void;
}

export function KolamCanvas({ parameters, kolamSvg, selectedSegmentId, onSegmentClick }: KolamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Inject style once on mount for selected segment highlighting
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-kolam-style', 'selected-segment');
    style.innerHTML = `
      .selected-kolam-segment {
        stroke: #f00 !important;
        stroke-width: 4 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!kolamSvg) return;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(kolamSvg, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    // Add event listeners and highlight selected segment
    const allSvgElements = svgElement.querySelectorAll("line, path");
    allSvgElements.forEach((element) => {
      const id = element.id;
      if (id) {
        element.addEventListener("click", () => onSegmentClick(id));
        if (id === selectedSegmentId) {
          element.classList.add("selected-kolam-segment");
        } else {
          element.classList.remove("selected-kolam-segment");
        }
      }
    });

    // Serialize back to string for rendering
    const serializer = new XMLSerializer();
    const modifiedSvgString = serializer.serializeToString(svgElement);

    // This ref will be used to render the SVG with interactive elements.
    // Since dangerouslySetInnerHTML doesn't allow attaching event listeners directly,
    // we need a slightly different approach or a wrapper component that can do this.
    // For now, let's update the div's inner HTML directly.
    const svgContainer = document.getElementById("kolam-svg-container");
    if (svgContainer) {
      svgContainer.innerHTML = modifiedSvgString;
    }

  }, [kolamSvg, selectedSegmentId, onSegmentClick]); // Dependencies

  if (kolamSvg) {
    return (
      <div
        id="kolam-svg-container"
        className="aspect-square bg-white rounded-lg border border-border p-4 flex items-center justify-center"
      />
    )
  }

  // Original canvas rendering logic (kept for fallback or future use if needed)
  // If kolamSvg is null, or if JS is disabled, this canvas will render.
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !parameters) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = parameters.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid dots
    ctx.fillStyle = parameters.strokeColor || "#164e63";
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const spacing = parameters.dotSpacing

    // Draw dots based on grid type
    if (parameters.gridType === "square") {
      for (let i = -parameters.rows / 2; i <= parameters.rows / 2; i++) {
        for (let j = -parameters.columns / 2; j <= parameters.columns / 2; j++) {
          const x = centerX + i * spacing
          const y = centerY + j * spacing
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }

    // Draw connecting lines based on symmetry
    ctx.strokeStyle = parameters.strokeColor || "#164e63";
    ctx.lineWidth = parameters.strokeType === "thick" ? 3 : 2

    if (parameters.strokeType === "dashed") {
      ctx.setLineDash([5, 5])
    } else if (parameters.strokeType === "dotted") {
      ctx.setLineDash([2, 3])
    } else {
      ctx.setLineDash([])
    }

    // Simple pattern generation based on symmetry type
    const drawPattern = () => {
      ctx.beginPath()

      if (parameters.symmetryType === "4-fold") {
        // Draw a simple 4-fold symmetric pattern
        const radius = (Math.min(parameters.rows, parameters.columns) * spacing) / 3

        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2
          const x1 = centerX + Math.cos(angle) * radius
          const y1 = centerY + Math.sin(angle) * radius
          const x2 = centerX + Math.cos(angle + Math.PI / 2) * radius
          const y2 = centerY + Math.sin(angle + Math.PI / 2) * radius

          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x1, y1)
          ctx.lineTo(x2, y2)
        }
      } else if (parameters.symmetryType === "radial") {
        // Draw radial pattern
        const radius = (Math.min(parameters.rows, parameters.columns) * spacing) / 3
        const spokes = 8

        for (let i = 0; i < spokes; i++) {
          const angle = (i * 2 * Math.PI) / spokes
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
        }

        // Add concentric circles
        for (let r = spacing; r <= radius; r += spacing) {
          ctx.moveTo(centerX + r, centerY)
          ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
        }
      } else {
        // Default simple pattern
        const size = (Math.min(parameters.rows, parameters.columns) * spacing) / 4
        ctx.rect(centerX - size, centerY - size, size * 2, size * 2)
        ctx.moveTo(centerX - size, centerY - size)
        ctx.lineTo(centerX + size, centerY + size)
        ctx.moveTo(centerX + size, centerY - size)
        ctx.lineTo(centerX - size, centerY + size)
      }

      ctx.stroke()
    }

    // Draw pattern with iterations
    for (let i = 0; i < parameters.iterations; i++) {
      ctx.save()
      ctx.globalAlpha = 1 - i * 0.2
      drawPattern()
      ctx.restore()
    }
  }, [parameters])

  return (
    <div className="aspect-square bg-white rounded-lg border border-border p-4">
      <canvas ref={canvasRef} className="w-full h-full" style={{ maxWidth: "100%", height: "auto" }} />
    </div>
  )
}
