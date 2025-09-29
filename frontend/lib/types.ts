export interface AnalysisResult {
  symmetryType: string;
  rotationPatterns: string[];
  gridSystem: string;
  complexity: string;
  symmetryScore?: number;
  complexityIndex?: number;
  dotDensity?: number;
  lineSmoothness?: number;
  colorVariance?: number;
  averageLineThickness?: number;
  dominantColors?: string[];
  specifications: {
    dimensions: string;
    dotCount: number;
    lineLength: string;
    strokeWidth: string;
  };
  algorithm: string[];
  culturalSignificance: string;
}

export interface KolamParametersType {
  designType: string;
  gridType: string;
  rows: number;
  columns: number;
  dotSpacing: number;
  rhombus_size: number;
  strokeType: string;
  symmetryType: string;
  strokeColor: string;
  backgroundColor: string;
  animationSpeed: number;
  // L-System specific parameters
  axiom?: string;
  rules?: string;
  angle?: number;
  iterations?: number;
}
