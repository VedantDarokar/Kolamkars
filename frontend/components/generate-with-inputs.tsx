"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation" // Import useRouter and useSearchParams
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { KolamCanvas } from "@/components/kolam-canvas"

interface KolamParametersType {
  gridType: string;
  rows: number;
  columns: number;
  dotSpacing: number;
  strokeType: string;
  symmetryType: string;
  iterations: number;
  rhombus_size: number;
  grid_size: number;
  polygon1_sides: number;
  polygon1_radius: number;
  polygon2_sides: number;
  polygon2_radius: number;
  axiom: string;
  rules: { [key: string]: string };
  angle: number;
  animationSpeed?: number; // Optional, as it's passed separately to generation functions
  strokeColor: string;
  backgroundColor: string;
  designType?: string; // Add designType to the interface
}

// Helper function to expand L-System string (Python equivalent)
const expandLsystemString = (axiom: string, rules: { [key: string]: string }, iterations: number): string => {
  let result = axiom
  for (let i = 0; i < iterations; i++) {
    result = result
      .split("")
      .map((char) => rules[char] || char)
      .join("")
  }
  return result
}

// Helper function to generate L-System Kolam SVG client-side
const generateLsystemKolamSvgClientSide = (parameters: any): string => {
  const { axiom, rules, angle, dotSpacing, iterations, animationSpeed, strokeColor, backgroundColor, excludedSegmentIds } = parameters
  const lsystemString = expandLsystemString(axiom, rules, iterations)

  let currentX = 300
  let currentY = 300
  let currentAngle = 0 // In degrees

  const svgElements: { type: string, x1?: number, y1?: number, x2?: number, y2?: number, pathData?: string, length: number, id: string }[] = []
  let totalLength = 0;
  let segmentCounter = 0; // To generate unique IDs

  const drawLineSvg = (length: number) => {
    const newX = currentX + length * Math.cos(currentAngle * Math.PI / 180)
    const newY = currentY + length * Math.sin(currentAngle * Math.PI / 180)
    const id = `lsystem-line-${segmentCounter++}`;
    if (!excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'line', x1: currentX, y1: currentY, x2: newX, y2: newY, length: length, id: id });
      totalLength += length;
    }
    currentX = newX
    currentY = newY
  }

  const drawArcSvg = (radius: number, angleDegrees: number) => {
    const currentAngleRad = currentAngle * Math.PI / 180
    let centerX, centerY;
    let absRadius = Math.abs(radius);

    let centerAngleRad;
    if (radius > 0) { // Left turn arc
      centerAngleRad = currentAngleRad + Math.PI / 2;
    } else { // Right turn arc
      centerAngleRad = currentAngleRad - Math.PI / 2;
      absRadius = Math.abs(radius);
    }

    centerX = currentX + absRadius * Math.cos(centerAngleRad);
    centerY = currentY + absRadius * Math.sin(centerAngleRad);

    const startAngleRad = Math.atan2(currentY - centerY, currentX - centerX);
    const endAngleRad = startAngleRad + angleDegrees * Math.PI / 180;

    let sweepFlag = radius > 0 ? 0 : 1; // 0 for CCW, 1 for CW in SVG arc (opposite of Python turtle logic for positive/negative radius)
    if (angleDegrees < 0) {
      sweepFlag = 1 - sweepFlag;
    }
    const largeArcFlag = Math.abs(angleDegrees) > 180 ? 1 : 0;

    const endX = centerX + absRadius * Math.cos(endAngleRad);
    const endY = centerY + absRadius * Math.sin(endAngleRad);

    const pathData = `M ${currentX},${currentY} A ${absRadius},${absRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX},${endY}`;
    const arcLength = Math.abs(angleDegrees * Math.PI / 180 * absRadius);
    const id = `lsystem-arc-${segmentCounter++}`;
    if (!excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'path', pathData: pathData, length: arcLength, id: id });
      totalLength += arcLength;
    }

    currentX = endX;
    currentY = endY;
    currentAngle += angleDegrees;
  }

  // Adjust initial position similar to the Python backend's L-System logic
  currentX = 300 - parameters.dotSpacing;
  currentY = 300 + parameters.dotSpacing;

  for (const symbol of lsystemString) {
    if (symbol === "F") {
      drawLineSvg(parameters.dotSpacing);
    } else if (symbol === "A") {
      drawArcSvg(parameters.dotSpacing, 90);
    } else if (symbol === "B") {
      const forwardUnits = 5 / (2 ** 0.5);
      drawLineSvg(forwardUnits);
      drawArcSvg(forwardUnits, 270);
    } else if (symbol === "+") {
      currentAngle += angle;
    } else if (symbol === "-") {
      currentAngle -= angle;
    }
  }

  // Determine stroke properties
  let strokeWidth = 2;
  let strokeDasharray = "0";
  switch (parameters.strokeType) {
    case "dashed":
      strokeDasharray = "10 5";
      break;
    case "dotted":
      strokeDasharray = "2 8";
      strokeWidth = 1;
      break;
    case "thick":
      strokeWidth = 4;
      break;
    case "continuous":
    default:
      strokeDasharray = "0";
      break;
  }

  // Generate animated SVG
  let accumulatedDelay = 0;
  const animationDurationPerSegment = animationSpeed || 100; // Use animationSpeed from parameters, default to 100ms

  const { svgElements: animatedSvgElements, animationStyles: animatedAnimationStyles } = svgElements.map((element) => {
    const id = element.id;
    const delay = accumulatedDelay; // Staggered delay
    // For L-System, each segment has a 'unit' length, so we use dotSpacing for relative duration
    accumulatedDelay += element.length / parameters.dotSpacing * animationDurationPerSegment; 

    const animationStyle = `
      #${id} {
        stroke-dasharray: ${element.length};
        stroke-dashoffset: ${element.length};
        animation: dash ${element.length / parameters.dotSpacing * animationDurationPerSegment}ms linear ${delay}ms forwards;
      }
    `;

    let svgElement = '';
    if (element.type === 'line') {
      svgElement = `<line id="${id}" x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" />`;
    } else if (element.type === 'path') {
      svgElement = `<path id="${id}" d="${element.pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="${strokeDasharray}" />`;
    }
    return { svgElement, animationStyle };
  }).reduce((acc, current) => ({
    svgElements: acc.svgElements + current.svgElement,
    animationStyles: acc.animationStyles + current.animationStyle,
  }), { svgElements: '', animationStyles: '', });

  return `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
            <style>
              @keyframes dash {
                to {
                  stroke-dashoffset: 0;
                }
              }
              ${animatedAnimationStyles}
            </style>
            <rect x="0" y="0" width="100%" height="100%" fill="${backgroundColor}" />
            ${animatedSvgElements}
          </svg>`
}

// Helper function to generate Suzhi Kolam SVG client-side
const generateSuzhiKolamSvgClientSide = (parameters: any): string => {
  const { rows, columns, dotSpacing, strokeType, gridType, symmetryType, animationSpeed, strokeColor, backgroundColor, excludedSegmentIds } = parameters;

  const dwgWidth = columns * dotSpacing + dotSpacing;
  const dwgHeight = rows * dotSpacing + dotSpacing;

  const svgElements: { type: string, x1?: number, y1?: number, x2?: number, y2?: number, pathData?: string, length: number, id: string }[] = []
  let totalLength = 0;
  let segmentCounter = 0; // To generate unique IDs

  // Helper to add a line segment for animation
  const addLineSegment = (x1: number, y1: number, x2: number, y2: number) => {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const id = `suzhi-line-${segmentCounter++}`;
    if (length > 0 && !excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'line', x1, y1, x2, y2, length, id });
      totalLength += length;
    }
  };

  // Helper to add an arc segment for animation
  const addArcSegment = (pathData: string, approximateLength: number) => {
    const id = `suzhi-arc-${segmentCounter++}`;
    if (approximateLength > 0 && !excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'path', pathData, length: approximateLength, id });
      totalLength += approximateLength;
    }
  };

  // Generate grid dots based on gridType
  const dots: { x: number, y: number }[] = [];
  if (gridType === "square") {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        dots.push({ x: c * dotSpacing + dotSpacing / 2, y: r * dotSpacing + dotSpacing / 2 });
      }
    }
  } else if (gridType === "triangular") {
    // For triangular grid, adjust positions based on row parity
    const h = dotSpacing * Math.sqrt(3) / 2; // Height of equilateral triangle
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const xOffset = (r % 2 === 0) ? 0 : dotSpacing / 2; // Offset for alternate rows
        dots.push({ x: c * dotSpacing + dotSpacing / 2 + xOffset, y: r * h + dotSpacing / 2 });
      }
    }
  } else if (gridType === "hexagonal") {
    const hexRadius = dotSpacing / Math.sqrt(3); // Radius of inner hexagon
    const rowHeight = hexRadius * 1.5; // Vertical distance between hex rows
    const colWidth = hexRadius * Math.sqrt(3); // Horizontal distance between hex columns

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = c * colWidth + (r % 2) * colWidth / 2 + dotSpacing / 2;
        const y = r * rowHeight + dotSpacing / 2;
        dots.push({ x, y });
      }
    }
  } else if (gridType === "circular") {
    const maxRadius = Math.min(dwgWidth, dwgHeight) / 2 - dotSpacing; // Max radius for dots
    const center = { x: dwgWidth / 2, y: dwgHeight / 2 };

    for (let r = 0; r < rows; r++) {
      const currentRadius = (maxRadius / rows) * (r + 1);
      const numDotsOnCircle = Math.max(8, Math.floor(2 * Math.PI * currentRadius / dotSpacing)); // Ensure enough dots
      for (let i = 0; i < numDotsOnCircle; i++) {
        const angle = (i * 2 * Math.PI) / numDotsOnCircle;
        dots.push({
          x: center.x + currentRadius * Math.cos(angle),
          y: center.y + currentRadius * Math.sin(angle),
        });
      }
    }
  }

  // Suzhi drawing logic: Connect adjacent dots horizontally and vertically
  // This is a basic example; more complex Suzhi patterns would involve specific rules for curves and loops.
  if (gridType === "square") {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const dotIndex = r * columns + c;
        const currentDot = dots[dotIndex];

        // Connect horizontally
        if (c < columns - 1) {
          const nextDot = dots[dotIndex + 1];
          addLineSegment(currentDot.x, currentDot.y, nextDot.x, nextDot.y);
        }

        // Connect vertically
        if (r < rows - 1) {
          const nextDot = dots[(r + 1) * columns + c];
          addLineSegment(currentDot.x, currentDot.y, nextDot.x, nextDot.y);
        }
      }
    }
  } else if (gridType === "triangular") {
    // For triangular grid, connect to neighbors. More complex.
    // Simplified: connect horizontal and diagonal neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const currentDot = dots[r * columns + c];

        // Connect right
        if (c < columns - 1) {
          const rightDot = dots[r * columns + (c + 1)];
          addLineSegment(currentDot.x, currentDot.y, rightDot.x, rightDot.y);
        }
        // Connect diagonal-down-right (if row is even)
        if (r < rows - 1) {
          const downRightDot = dots[(r + 1) * columns + c + (r % 2 === 0 ? 0 : -1)]; // Adjust for triangular offset
          if (downRightDot) addLineSegment(currentDot.x, currentDot.y, downRightDot.x, downRightDot.y);
        }
        // Connect diagonal-down-left (if row is odd)
        if (r < rows - 1) {
          const downLeftDot = dots[(r + 1) * columns + c + (r % 2 === 0 ? -1 : 0)]; // Adjust for triangular offset
          if (downLeftDot) addLineSegment(currentDot.x, currentDot.y, downLeftDot.x, downLeftDot.y);
        }
      }
    }
  } else if (gridType === "hexagonal") {
    // Similar logic as triangular, connecting to 6 neighbors
    // This is a basic grid connection. A true Suzhi would have curves.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const currentDot = dots[r * columns + c];

        // Connect right
        if (c < columns - 1) {
          const rightDot = dots[r * columns + c + 1];
          addLineSegment(currentDot.x, currentDot.y, rightDot.x, rightDot.y);
        }
        // Connect to specific diagonal neighbors based on row parity
        if (r < rows - 1) {
          // Down-left
          if (r % 2 === 0 && c > 0) {
            const downLeftDot = dots[(r + 1) * columns + c - 1];
            addLineSegment(currentDot.x, currentDot.y, downLeftDot.x, downLeftDot.y);
          }
          // Down-right
          const downRightDot = dots[(r + 1) * columns + c + (r % 2 === 0 ? 0 : 1)];
          if (downRightDot) addLineSegment(currentDot.x, currentDot.y, downRightDot.x, downRightDot.y);
        }
      }
    }
  } else if (gridType === "circular") {
    // For circular grids, connect dots on the same circle and adjacent circles
    for (let i = 0; i < dots.length; i++) {
      const currentDot = dots[i];
      // We'll simply draw a few circles as a placeholder.
      addArcSegment(`M ${currentDot.x - 5},${currentDot.y} A 5,5 0 1 0 ${currentDot.x + 5},${currentDot.y} A 5,5 0 1 0 ${currentDot.x - 5},${currentDot.y}`, 2 * Math.PI * 5); // Draw a small circle around each dot
    }
  }

  // Determine stroke properties
  let strokeWidth = 2;
  let strokeDasharray = "0";
  switch (strokeType) {
    case "dashed":
      strokeDasharray = "10 5";
      break;
    case "dotted":
      strokeDasharray = "2 8";
      strokeWidth = 1;
      break;
    case "thick":
      strokeWidth = 4;
      break;
    case "continuous":
    default:
      strokeDasharray = "0";
      break;
  }

  // Generate animated SVG
  let accumulatedDelay = 0;
  const animationDurationPerSegment = animationSpeed || 100; // Use animationSpeed from parameters, default to 100ms

  const { svgElements: animatedSvgElements, animationStyles: animatedAnimationStyles } = svgElements.map((element) => {
    const id = element.id;
    const delay = accumulatedDelay; // Staggered delay
    // For Suzhi, segment length will vary, so use raw length for relative duration
    accumulatedDelay += element.length / dotSpacing * animationDurationPerSegment; 

    const animationStyle = `
      #${id} {
        stroke-dasharray: ${element.length};
        stroke-dashoffset: ${element.length};
        animation: dash ${element.length / dotSpacing * animationDurationPerSegment}ms linear ${delay}ms forwards;
      }
    `;

    let svgElement = '';
    if (element.type === 'line') {
      svgElement = `<line id="${id}" x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" />`;
    } else if (element.type === 'path') {
      svgElement = `<path id="${id}" d="${element.pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="${strokeDasharray}" />`;
    }
    return { svgElement, animationStyle };
  }).reduce((acc, current) => ({
    svgElements: acc.svgElements + current.svgElement,
    animationStyles: acc.animationStyles + current.animationStyle,
  }), { svgElements: '', animationStyles: '', });

  return `<svg width="${dwgWidth}" height="${dwgHeight}" viewBox="0 0 ${dwgWidth} ${dwgHeight}" xmlns="http://www.w3.org/2000/svg">
            <style>
              @keyframes dash {
                to {
                  stroke-dashoffset: 0;
                }
              }
              ${animatedAnimationStyles}
            </style>
            <rect x="0" y="0" width="100%" height="100%" fill="${backgroundColor}" />
            ${animatedSvgElements}
          </svg>`
}

// Helper function to generate Kambi Kolam SVG client-side
const generateKambiKolamSvgClientSide = (parameters: any): string => {
  const { rows, columns, dotSpacing, rhombus_size, strokeType, gridType, symmetryType, animationSpeed, strokeColor, backgroundColor, excludedSegmentIds } = parameters;

  const dwgWidth = columns * dotSpacing + dotSpacing;
  const dwgHeight = rows * dotSpacing + dotSpacing;

  const svgElements: { type: string, x1?: number, y1?: number, x2?: number, y2?: number, pathData?: string, length: number, id: string }[] = []
  let totalLength = 0;
  let segmentCounter = 0; // To generate unique IDs

  // Helper to add a line segment for animation
  const addLineSegment = (x1: number, y1: number, x2: number, y2: number) => {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const id = `kambi-line-${segmentCounter++}`;
    if (length > 0 && !excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'line', x1, y1, x2, y2, length, id });
      totalLength += length;
    }
  };

  // Helper to add an arc segment for animation
  const addArcSegment = (pathData: string, approximateLength: number) => {
    const id = `kambi-arc-${segmentCounter++}`;
    if (approximateLength > 0 && !excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'path', pathData, length: approximateLength, id });
      totalLength += approximateLength;
    }
  };

  // Generate grid dots based on gridType (reusing logic from Suzhi)
  const dots: { x: number, y: number }[] = [];
  if (gridType === "square") {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        dots.push({ x: c * dotSpacing + dotSpacing / 2, y: r * dotSpacing + dotSpacing / 2 });
      }
    }
  } else if (gridType === "triangular") {
    const h = dotSpacing * Math.sqrt(3) / 2; 
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const xOffset = (r % 2 === 0) ? 0 : dotSpacing / 2; 
        dots.push({ x: c * dotSpacing + dotSpacing / 2 + xOffset, y: r * h + dotSpacing / 2 });
      }
    }
  } else if (gridType === "hexagonal") {
    const hexRadius = dotSpacing / Math.sqrt(3); 
    const rowHeight = hexRadius * 1.5; 
    const colWidth = hexRadius * Math.sqrt(3); 

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = c * colWidth + (r % 2) * colWidth / 2 + dotSpacing / 2;
        const y = r * rowHeight + dotSpacing / 2;
        dots.push({ x, y });
      }
    }
  } else if (gridType === "circular") {
    const maxRadius = Math.min(dwgWidth, dwgHeight) / 2 - dotSpacing; 
    const center = { x: dwgWidth / 2, y: dwgHeight / 2 };

    for (let r = 0; r < rows; r++) {
      const currentRadius = (maxRadius / rows) * (r + 1);
      const numDotsOnCircle = Math.max(8, Math.floor(2 * Math.PI * currentRadius / dotSpacing)); 
      for (let i = 0; i < numDotsOnCircle; i++) {
        const angle = (i * 2 * Math.PI) / numDotsOnCircle;
        dots.push({
          x: center.x + currentRadius * Math.cos(angle),
          y: center.y + currentRadius * Math.sin(angle),
        });
      }
    }
  }

  // Kambi drawing logic: Draw rhombuses around each dot
  const rSize = rhombus_size * dotSpacing; // Adjust rhombus size based on dot spacing

  if (gridType === "square") {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const dotIndex = r * columns + c;
        const currentDot = dots[dotIndex];

        // Draw rhombuses around each dot
        addLineSegment(currentDot.x, currentDot.y - rSize / 2, currentDot.x + rSize / 2, currentDot.y);
        addLineSegment(currentDot.x + rSize / 2, currentDot.y, currentDot.x, currentDot.y + rSize / 2);
        addLineSegment(currentDot.x, currentDot.y + rSize / 2, currentDot.x - rSize / 2, currentDot.y);
        addLineSegment(currentDot.x - rSize / 2, currentDot.y, currentDot.x, currentDot.y - rSize / 2);
      }
    }
  } else if (gridType === "triangular") {
    // Kambi on triangular grid: more complex, placeholder drawing circles around dots
    for (const dot of dots) {
      addArcSegment(`M ${dot.x - rSize / 4},${dot.y} A ${rSize / 4},${rSize / 4} 0 1 0 ${dot.x + rSize / 4},${dot.y} A ${rSize / 4},${rSize / 4} 0 1 0 ${dot.x - rSize / 4},${dot.y}`, 2 * Math.PI * (rSize / 4));
    }
  } else if (gridType === "hexagonal") {
    // Kambi on hexagonal grid: placeholder drawing circles around dots
    for (const dot of dots) {
      addArcSegment(`M ${dot.x - rSize / 4},${dot.y} A ${rSize / 4},${rSize / 4} 0 1 0 ${dot.x + rSize / 4},${dot.y} A ${rSize / 4},${rSize / 4} 0 1 0 ${dot.x - rSize / 4},${dot.y}`, 2 * Math.PI * (rSize / 4));
    }
  } else if (gridType === "circular") {
    // Kambi on circular grid: placeholder drawing circles around dots
    for (const dot of dots) {
      addArcSegment(`M ${dot.x - rSize / 4},${dot.y} A ${rSize / 4},${rSize / 4} 0 1 0 ${dot.x + rSize / 4},${dot.y} A ${rSize / 4},${rSize / 4} 0 1 0 ${dot.x - rSize / 4},${dot.y}`, 2 * Math.PI * (rSize / 4));
    }
  }

  // Determine stroke properties
  let strokeWidth = 2;
  let strokeDasharray = "0";
  switch (strokeType) {
    case "dashed":
      strokeDasharray = "10 5";
      break;
    case "dotted":
      strokeDasharray = "2 8";
      strokeWidth = 1;
      break;
    case "thick":
      strokeWidth = 4;
      break;
    case "continuous":
    default:
      strokeDasharray = "0";
      break;
  }

  // Generate animated SVG
  let accumulatedDelay = 0;
  const animationDurationPerSegment = animationSpeed || 100; // Use animationSpeed from parameters, default to 100ms

  const { svgElements: animatedSvgElements, animationStyles: animatedAnimationStyles } = svgElements.map((element) => {
    const id = element.id;
    const delay = accumulatedDelay; // Staggered delay
    // For Kambi, segment length will vary, so use raw length for relative duration
    accumulatedDelay += element.length / dotSpacing * animationDurationPerSegment; 

    const animationStyle = `
      #${id} {
        stroke-dasharray: ${element.length};
        stroke-dashoffset: ${element.length};
        animation: dash ${element.length / dotSpacing * animationDurationPerSegment}ms linear ${delay}ms forwards;
      }
    `;

    let svgElement = '';
    if (element.type === 'line') {
      svgElement = `<line id="${id}" x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" />`;
    } else if (element.type === 'path') {
      svgElement = `<path id="${id}" d="${element.pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="${strokeDasharray}" />`;
    }
    return { svgElement, animationStyle };
  }).reduce((acc, current) => ({
    svgElements: acc.svgElements + current.svgElement,
    animationStyles: acc.animationStyles + current.animationStyle,
  }), { svgElements: '', animationStyles: '', });

  return `<svg width="${dwgWidth}" height="${dwgHeight}" viewBox="0 0 ${dwgWidth} ${dwgHeight}" xmlns="http://www.w3.org/2000/svg">
            <style>
              @keyframes dash {
                to {
                  stroke-dashoffset: 0;
                }
              }
              ${animatedAnimationStyles}
            </style>
            <rect x="0" y="0" width="100%" height="100%" fill="${backgroundColor}" />
            ${animatedSvgElements}
          </svg>`
}

// Helper function to generate Group Theory Kolam SVG client-side
const generateGroupTheoryKolamSvgClientSide = (parameters: any): string => {
  const {
    grid_size,
    polygon1_sides,
    polygon1_radius,
    polygon2_sides,
    polygon2_radius,
    strokeType,
    animationSpeed,
    strokeColor,
    backgroundColor,
    excludedSegmentIds,
  } = parameters

  const dwgWidth = 800;
  const dwgHeight = 800;
  const center_x = dwgWidth / 2;
  const center_y = dwgHeight / 2;
  const scale_factor = 40; // Corresponds to the 40 used in the python turtle example

  const svgElements: { type: string, pathData: string, length: number, id: string }[] = []
  let totalLength = 0;
  let segmentCounter = 0; // To generate unique IDs

  // Function to add a path segment and approximate its length
  const addPathSegment = (pathData: string) => {
    // A very rough approximation for path length for animation purposes.
    // A more accurate method would involve SVG DOM parsing and getTotalLength(),
    // but that's not feasible in a pure string generation context.
    const length = pathData.length; // Placeholder length, can be refined for better animation timing
    const id = `grouptheory-path-${segmentCounter++}`;
    if (!excludedSegmentIds.includes(id)) {
      svgElements.push({ type: 'path', pathData, length, id });
      totalLength += length;
    }
  };

  const getPolygonPoints = (sides: number, radius: number) => {
    const localPoints: { x: number, y: number }[] = [];
    const angleStep = (2 * Math.PI) / sides;
    for (let i = 0; i < sides; i++) {
      const x = radius * Math.cos(i * angleStep);
      const y = radius * Math.sin(i * angleStep);
      localPoints.push({ x, y });
    }
    return localPoints;
  };

  const polygon1Local = getPolygonPoints(polygon1_sides, polygon1_radius);
  const polygon2Local = getPolygonPoints(polygon2_sides, polygon2_radius);

  const grid_offset_x = center_x - (grid_size - 1) * scale_factor / 2;
  const grid_offset_y = center_y - (grid_size - 1) * scale_factor / 2;

  for (let r_idx = 0; r_idx < grid_size; r_idx++) {
    for (let c_idx = 0; c_idx < grid_size; c_idx++) {
      const currentPolygonLocal = (r_idx + c_idx) % 2 === 0 ? polygon1Local : polygon2Local;
      
      // Calculate the position for each polygon based on grid index
      const offset_x = grid_offset_x + c_idx * scale_factor;
      const offset_y = grid_offset_y + r_idx * scale_factor;

      let pathData = '';
      for (let i = 0; i < currentPolygonLocal.length; i++) {
        const { x: px, y: py } = currentPolygonLocal[i];
        const finalX = offset_x + px * scale_factor / 3; // Scale factor applied as in backend
        const finalY = offset_y + py * scale_factor / 3; // Scale factor applied as in backend
        if (i === 0) {
          pathData += `M ${finalX},${finalY}`;
        } else {
          pathData += ` L ${finalX},${finalY}`;
        }
      }
      if (currentPolygonLocal.length > 0) {
        pathData += ` Z`; // Close the polygon
        addPathSegment(pathData);
      }
    }
  }

  // Determine stroke properties
  let strokeWidth = 2;
  let strokeDasharray = "0";
  switch (strokeType) {
    case "dashed":
      strokeDasharray = "10 5";
      break;
    case "dotted":
      strokeDasharray = "2 8";
      strokeWidth = 1;
      break;
    case "thick":
      strokeWidth = 4;
      break;
    case "continuous":
    default:
      strokeDasharray = "0";
      break;
  }

  // Generate animated SVG
  let accumulatedDelay = 0;
  const animationDurationPerSegment = animationSpeed || 100; // Use animationSpeed from parameters, default to 100ms

  const { svgElements: animatedSvgElements, animationStyles: animatedAnimationStyles } = svgElements.map((element) => {
    const id = element.id;
    const delay = accumulatedDelay; // Staggered delay
    accumulatedDelay += element.length * animationDurationPerSegment; // Increment delay based on rough length

    const animationStyle = `
      #${id} {
        stroke-dasharray: ${element.length};
        stroke-dashoffset: ${element.length};
        animation: dash ${element.length * animationDurationPerSegment}ms linear ${delay}ms forwards;
      }
    `;

    const svgElement = `<path id="${id}" d="${element.pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="${strokeDasharray}" />`;
    return { svgElement, animationStyle };
  }).reduce((acc, current) => ({
    svgElements: acc.svgElements + current.svgElement,
    animationStyles: acc.animationStyles + current.animationStyle,
  }), { svgElements: '', animationStyles: '', });

  return `<svg width="${dwgWidth}" height="${dwgHeight}" viewBox="0 0 ${dwgWidth} ${dwgHeight}" xmlns="http://www.w3.org/2000/svg">
            <style>
              @keyframes dash {
                to {
                  stroke-dashoffset: 0;
                }
              }
              ${animatedAnimationStyles}
            </style>
            <rect x="0" y="0" width="100%" height="100%" fill="${backgroundColor}" />
            ${animatedSvgElements}
          </svg>`
}

// Main component
export function GenerateWithInputs() {
  const [parameters, setParameters] = useState<KolamParametersType>({
    gridType: "square",
    rows: 8,
    columns: 8,
    dotSpacing: 20,
    strokeType: "continuous",
    symmetryType: "4-fold",
    iterations: 1,
    rhombus_size: 5, // Initialize rhombus_size
    grid_size: 8, // Initialize grid_size
    polygon1_sides: 6, // Initialize polygon1_sides
    polygon1_radius: 3, // Initialize polygon1_radius
    polygon2_sides: 8, // Initialize polygon2_sides
    polygon2_radius: 2, // Initialize polygon2_radius
    axiom: "FBFBFBFB", // Initialize axiom for L-System
    rules: { "A": "AFBFA", "B": "AFBFBFBFA" }, // Initialize rules for L-System
    angle: 45, // Initialize angle for L-System
    strokeColor: "#000000", // Default stroke color (black)
    backgroundColor: "#ffffff", // Default background color (white)
  })
  const [designType, setDesignType] = useState("lsystem")
  const [kolamSvg, setKolamSvg] = useState<string | null>(null) // Changed from kolamImageBase64
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animationSpeed, setAnimationSpeed] = useState<number>(100); // Default to 100ms per segment
  const [presetName, setPresetName] = useState<string>("");
  const [savedPresets, setSavedPresets] = useState<{ [key: string]: KolamParametersType }>({});
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null); // New state for selected segment
  const [excludedSegmentIds, setExcludedSegmentIds] = useState<string[]>([]); // New state for excluded segments

  // Effect to load presets from local storage on component mount
  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem("kolamPresets");
      if (storedPresets) {
        setSavedPresets(JSON.parse(storedPresets));
      }
    } catch (e) {
      console.error("Failed to load presets from local storage", e);
    }
  }, []);

  // Effect to read URL parameters and pre-fill state
  useEffect(() => {
    const designTypeParam = searchParams.get("designType");
    const axiomParam = searchParams.get("axiom");
    const rulesParam = searchParams.get("rules");
    const angleParam = searchParams.get("angle");
    const dotSpacingParam = searchParams.get("dotSpacing");
    const iterationsParam = searchParams.get("iterations");
    const rhombusSizeParam = searchParams.get("rhombus_size");
    const gridSizeParam = searchParams.get("grid_size");
    const polygon1SidesParam = searchParams.get("polygon1_sides");
    const polygon1RadiusParam = searchParams.get("polygon1_radius");
    const polygon2SidesParam = searchParams.get("polygon2_sides");
    const polygon2RadiusParam = searchParams.get("polygon2_radius");
    const symmetryTypeParam = searchParams.get("symmetryType");
    const gridTypeParam = searchParams.get("gridType");

    if (designTypeParam) {
      setDesignType(designTypeParam);
      setParameters(prevParams => {
        const newParams = { ...prevParams };

        if (axiomParam) newParams.axiom = axiomParam;
        if (rulesParam) {
          try {
            newParams.rules = JSON.parse(rulesParam);
          } catch (e) {
            console.error("Failed to parse rules JSON from URL:", e);
          }
        }
        if (angleParam) newParams.angle = Number.parseInt(angleParam);
        if (dotSpacingParam) newParams.dotSpacing = Number.parseInt(dotSpacingParam);
        if (iterationsParam) newParams.iterations = Number.parseInt(iterationsParam);
        if (rhombusSizeParam) newParams.rhombus_size = Number.parseInt(rhombusSizeParam);
        if (gridSizeParam) newParams.grid_size = Number.parseInt(gridSizeParam);
        if (polygon1SidesParam) newParams.polygon1_sides = Number.parseInt(polygon1SidesParam);
        if (polygon1RadiusParam) newParams.polygon1_radius = Number.parseInt(polygon1RadiusParam);
        if (polygon2SidesParam) newParams.polygon2_sides = Number.parseInt(polygon2SidesParam);
        if (polygon2RadiusParam) newParams.polygon2_radius = Number.parseInt(polygon2RadiusParam);
        if (symmetryTypeParam) newParams.symmetryType = symmetryTypeParam;
        if (gridTypeParam) newParams.gridType = gridTypeParam;

        return newParams;
      });

      // Automatically generate the Kolam if parameters were loaded from URL
      // This might be tricky because generateKolam is an async function and state updates are async.
      // For now, we'll let the user manually click generate after pre-fill.
      // Alternatively, we could trigger generateKolam here, but careful with useEffect dependency array.
    }

    // Clean up URL parameters after use to avoid re-triggering on subsequent renders
    // This is optional but can make the URL cleaner.
    // const newUrl = new URL(window.location.href);
    // Array.from(searchParams.keys()).forEach(key => newUrl.searchParams.delete(key));
    // router.replace(newUrl.pathname + newUrl.search);

  }, [searchParams]); // Depend on searchParams to react to URL changes

  // Function to save SVG as a file
  const saveSvgAsFile = () => {
    if (kolamSvg) {
      const blob = new Blob([kolamSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kolam_design.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Function to save SVG as PNG
  const saveSvgAsPng = () => {
    if (kolamSvg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgBlob = new Blob([kolamSvg], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'kolam_design.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = url;
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSavePreset = () => {
    if (presetName.trim() === "") {
      setError("Please enter a name for the preset.");
      return;
    }
    const newPresets = { ...savedPresets, [presetName]: parameters };
    setSavedPresets(newPresets);
    localStorage.setItem("kolamPresets", JSON.stringify(newPresets));
    setError(null);
    setPresetName(""); // Clear the input after saving
    // Optionally show a toast notification
  };

  const handleLoadPreset = (name: string) => {
    const preset = savedPresets[name];
    if (preset) {
      setParameters(preset);
      setDesignType(preset.designType || "lsystem"); // Ensure designType is set correctly
      // Optionally set animation speed if it's part of the preset or derived
      setAnimationSpeed(preset.animationSpeed || 100);
      setExcludedSegmentIds([]); // Clear excluded segments when loading a new preset
      setError(null);
    } else {
      setError("Preset not found.");
    }
  };

  const handleDeleteSegment = () => {
    if (selectedSegmentId) {
      setExcludedSegmentIds((prev) => [...prev, selectedSegmentId]);
      setSelectedSegmentId(null); // Deselect after marking for deletion
      // Trigger a re-generation to apply the deletion
      generateKolam(); 
    }
  };

  const generateKolam = async () => {
    setLoading(true)
    setError(null)

    if (designType === "lsystem") {
      try {
        const svgData = generateLsystemKolamSvgClientSide({
          axiom: parameters.axiom,
          rules: parameters.rules,
          angle: parameters.angle,
          dotSpacing: parameters.dotSpacing,
          iterations: parameters.iterations,
          animationSpeed: animationSpeed, // Pass animationSpeed
          strokeColor: parameters.strokeColor, // Pass strokeColor
          backgroundColor: parameters.backgroundColor, // Pass backgroundColor
          excludedSegmentIds: excludedSegmentIds, // Pass excludedSegmentIds
        });
        setKolamSvg(svgData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    } else if (designType === "suzhi") {
      try {
        const svgData = generateSuzhiKolamSvgClientSide({
          rows: parameters.rows,
          columns: parameters.columns,
          dotSpacing: parameters.dotSpacing,
          strokeType: parameters.strokeType,
          gridType: parameters.gridType,
          symmetryType: parameters.symmetryType,
          animationSpeed: animationSpeed, // Pass animationSpeed
          strokeColor: parameters.strokeColor, // Pass strokeColor
          backgroundColor: parameters.backgroundColor, // Pass backgroundColor
          excludedSegmentIds: excludedSegmentIds, // Pass excludedSegmentIds
        });
        setKolamSvg(svgData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    } else if (designType === "kambi") {
      try {
        const svgData = generateKambiKolamSvgClientSide({
          rows: parameters.rows,
          columns: parameters.columns,
          dotSpacing: parameters.dotSpacing,
          rhombus_size: parameters.rhombus_size,
          strokeType: parameters.strokeType,
          gridType: parameters.gridType,
          symmetryType: parameters.symmetryType,
          animationSpeed: animationSpeed, // Pass animationSpeed
          strokeColor: parameters.strokeColor, // Pass strokeColor
          backgroundColor: parameters.backgroundColor, // Pass backgroundColor
          excludedSegmentIds: excludedSegmentIds, // Pass excludedSegmentIds
        });
        setKolamSvg(svgData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    } else if (designType === "grouptheory") {
      try {
        const svgData = generateGroupTheoryKolamSvgClientSide({
          grid_size: parameters.grid_size,
          polygon1_sides: parameters.polygon1_sides,
          polygon1_radius: parameters.polygon1_radius,
          polygon2_sides: parameters.polygon2_sides,
          polygon2_radius: parameters.polygon2_radius,
          strokeType: parameters.strokeType,
          animationSpeed: animationSpeed, // Pass animationSpeed
          strokeColor: parameters.strokeColor, // Pass strokeColor
          backgroundColor: parameters.backgroundColor, // Pass backgroundColor
          excludedSegmentIds: excludedSegmentIds, // Pass excludedSegmentIds
        });
        setKolamSvg(svgData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Existing backend call (this block will be effectively unused after all types are client-side)
    try {
      const response = await fetch("https://kolamkars.onrender.com/generate-kolam-svg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...parameters, design_type: designType }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`)
      }

      const svgData = await response.text() 
      setKolamSvg(svgData)

    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Optionally generate a kolam on initial load
    // generateKolam();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Design Parameters</CardTitle>
          <CardDescription>Adjust the settings below to customize your Kolam design</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Design Type */}
          <div className="space-y-2">
            <Label htmlFor="design-type">Design Type</Label>
            <Select value={designType} onValueChange={(value) => setDesignType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select design type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lsystem">L-System Kolam</SelectItem>
                <SelectItem value="suzhi">Suzhi Kolam</SelectItem>
                <SelectItem value="kambi">Kambi Kolam</SelectItem>
                <SelectItem value="grouptheory">Group Theory Kolam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {designType === "kambi" && (
            <div className="space-y-2">
              <Label htmlFor="rhombus-size">Rhombus Size</Label>
              <Input
                id="rhombus-size"
                type="number"
                min="1"
                max="10"
                value={parameters.rhombus_size}
                onChange={(e) => handleParameterChange("rhombus_size", Number.parseInt(e.target.value))}
              />
            </div>
          )}

          {designType === "grouptheory" && (
            <div className="space-y-4">
              <h4 className="font-medium text-card-foreground mt-4">Group Theory Parameters</h4>
              <div className="space-y-2">
                <Label htmlFor="grid-size">Grid Size</Label>
                <Input
                  id="grid-size"
                  type="number"
                  min="1"
                  max="20"
                  value={parameters.grid_size}
                  onChange={(e) => handleParameterChange("grid_size", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="polygon1-sides">Polygon 1 Sides</Label>
                <Input
                  id="polygon1-sides"
                  type="number"
                  min="3"
                  max="10"
                  value={parameters.polygon1_sides}
                  onChange={(e) => handleParameterChange("polygon1_sides", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="polygon1-radius">Polygon 1 Radius</Label>
                <Input
                  id="polygon1-radius"
                  type="number"
                  min="1"
                  max="10"
                  value={parameters.polygon1_radius}
                  onChange={(e) => handleParameterChange("polygon1_radius", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="polygon2-sides">Polygon 2 Sides</Label>
                <Input
                  id="polygon2-sides"
                  type="number"
                  min="3"
                  max="10"
                  value={parameters.polygon2_sides}
                  onChange={(e) => handleParameterChange("polygon2_sides", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="polygon2-radius">Polygon 2 Radius</Label>
                <Input
                  id="polygon2-radius"
                  type="number"
                  min="1"
                  max="10"
                  value={parameters.polygon2_radius}
                  onChange={(e) => handleParameterChange("polygon2_radius", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Grid Type */}
          <div className="space-y-2">
            <Label htmlFor="grid-type">Grid Type</Label>
            <Select value={parameters.gridType} onValueChange={(value) => handleParameterChange("gridType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select grid type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square Grid</SelectItem>
                <SelectItem value="triangular">Triangular Grid</SelectItem>
                <SelectItem value="hexagonal">Hexagonal Grid</SelectItem>
                <SelectItem value="circular">Circular Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rows and Columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="3"
                max="20"
                value={parameters.rows}
                onChange={(e) => handleParameterChange("rows", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="columns">Columns</Label>
              <Input
                id="columns"
                type="number"
                min="3"
                max="20"
                value={parameters.columns}
                onChange={(e) => handleParameterChange("columns", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Dot Spacing */}
          <div className="space-y-2">
            <Label>Dot Spacing: {parameters.dotSpacing}px</Label>
            <Slider
              value={[parameters.dotSpacing]}
              onValueChange={(value) => handleParameterChange("dotSpacing", value[0])}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
          </div>

          {/* Stroke Type */}
          <div className="space-y-2">
            <Label htmlFor="stroke-type">Stroke Type</Label>
            <Select value={parameters.strokeType} onValueChange={(value) => handleParameterChange("strokeType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stroke type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="continuous">Continuous Line</SelectItem>
                <SelectItem value="dashed">Dashed Line</SelectItem>
                <SelectItem value="dotted">Dotted Line</SelectItem>
                <SelectItem value="thick">Thick Line</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Symmetry Type */}
          <div className="space-y-2">
            <Label htmlFor="symmetry-type">Symmetry Type</Label>
            <Select
              value={parameters.symmetryType}
              onValueChange={(value) => handleParameterChange("symmetryType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select symmetry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-fold">2-fold Rotational</SelectItem>
                <SelectItem value="4-fold">4-fold Rotational</SelectItem>
                <SelectItem value="6-fold">6-fold Rotational</SelectItem>
                <SelectItem value="8-fold">8-fold Rotational</SelectItem>
                <SelectItem value="radial">Radial Symmetry</SelectItem>
                <SelectItem value="bilateral">Bilateral Symmetry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Iterations */}
          <div className="space-y-2">
            <Label>Iterations: {parameters.iterations}</Label>
            <Slider
              value={[parameters.iterations]}
              onValueChange={(value) => handleParameterChange("iterations", value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          {/* Stroke Color */}
          <div className="space-y-2">
            <Label htmlFor="stroke-color">Stroke Color</Label>
            <Input
              id="stroke-color"
              type="color"
              value={parameters.strokeColor}
              onChange={(e) => handleParameterChange("strokeColor", e.target.value)}
              className="w-full"
            />
          </div>
          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <Input
              id="background-color"
              type="color"
              value={parameters.backgroundColor}
              onChange={(e) => handleParameterChange("backgroundColor", e.target.value)}
              className="w-full"
            />
          </div>
          {/* Animation Speed */}
          <div className="space-y-2">
            <Label>Animation Speed: {animationSpeed}ms/segment</Label>
            <Slider
              value={[animationSpeed]}
              onValueChange={(value) => setAnimationSpeed(value[0])}
              max={500} // Max animation duration per segment
              min={10}  // Min animation duration per segment
              step={10}
              className="w-full"
            />
          </div>
          {/* Preset Management */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-medium text-card-foreground">Save/Load Presets</h4>
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name"
              />
            </div>
            <Button onClick={handleSavePreset} className="w-full" variant="outline">
              Save Current Design as Preset
            </Button>
            {Object.keys(savedPresets).length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="load-preset">Load Preset</Label>
                <Select onValueChange={(value) => handleLoadPreset(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(savedPresets).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button onClick={generateKolam} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Kolam"}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
        </CardContent>
      </Card>

      {/* Canvas Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Generated Design</CardTitle>
          <CardDescription>Your Kolam pattern will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <KolamCanvas
            parameters={parameters} // parameters are still needed for the interface, even if not directly used in KolamCanvas anymore
            kolamSvg={kolamSvg}
            selectedSegmentId={selectedSegmentId}
            onSegmentClick={setSelectedSegmentId}
            // Pass excluded segments to KolamCanvas if needed for visual feedback
            // For now, the generation functions will handle actual exclusion
          />

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={saveSvgAsFile} disabled={!kolamSvg} className="flex-1 sm:flex-none">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Save as SVG
            </Button>
            <Button onClick={saveSvgAsPng} disabled={!kolamSvg} variant="outline" className="flex-1 sm:flex-none bg-transparent">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Save as PNG
            </Button>
            <Button variant="secondary" className="flex-1 sm:flex-none">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analyze This
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-4 flex justify-between">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
