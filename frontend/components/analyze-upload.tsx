"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { AnalysisResult } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function AnalyzeUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Function to handle downloading the analysis report
  const handleDownloadReport = useCallback(() => {
    if (analysisResult) {
      const reportContent = JSON.stringify(analysisResult, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kolam_analysis_report.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [analysisResult]);

  // Function to handle sharing the analysis (copy to clipboard)
  const handleShareAnalysis = useCallback(async () => {
    if (analysisResult) {
      const reportContent = JSON.stringify(analysisResult, null, 2);
      try {
        await navigator.clipboard.writeText(reportContent);
        alert("Analysis results copied to clipboard!"); // Simple feedback
      } catch (err) {
        console.error("Failed to copy analysis results: ", err);
        alert("Failed to copy analysis results.");
      }
    }
  }, [analysisResult]);

  // Function to handle recreating the design on the generate page
  const handleRecreateDesign = useCallback(() => {
    if (analysisResult) {
      const router = useRouter();
      const params = new URLSearchParams();

      // Force designType to "kambi" and set parameters consistent with the hardcoded Kambi analysis
      const designTypeToRecreate = "kambi";
      params.set("designType", designTypeToRecreate);
      params.set("gridType", "square"); // Kambi typically uses a square or staggered grid
      params.set("rows", "9"); // Based on the 9x9 maximal outer dimension
      params.set("columns", "9"); // Based on the 9x9 maximal outer dimension
      params.set("dotSpacing", "25"); // A reasonable default for dot spacing
      params.set("rhombus_size", "3"); // A typical rhombus size for Kambi
      params.set("strokeType", "continuous"); // Default to continuous
      params.set("symmetryType", "4-fold"); // Consistent with D4 symmetry
      params.set("strokeColor", "#8B0000"); // Default to reddish-brown

      router.push(`/generate?${params.toString()}`);
    }
  }, [analysisResult]);

  // Helper function for client-side image analysis (placeholder)
  // const analyzeImageClientSide = (imageData: string): AnalysisResult => {
  //   // Hardcoded Kambi Kolam analysis results as requested
  //   return {
  //     symmetryType: "Mathematical Analysis",
  //     rotationPatterns: [
  //       "90-degree Rotational Symmetry",
  //       "180-degree Rotational Symmetry",
  //       "270-degree Rotational Symmetry",
  //       "Four lines of Reflectional Symmetry (axes and diagonals)",
  //     ],
  //     gridSystem: "Pulli Kolam (Kambi Kolam)",
  //     complexity: "Intermediate to Advanced",
  //     symmetryScore: 0.95, // High score for well-defined symmetry
  //     complexityIndex: 0.75, // Mid-high complexity
  //     dotDensity: 0.60, // Relative density based on a 9x9 maximal grid
  //     lineSmoothness: 0.90, // Assumed high for well-drawn Kolam
  //     colorVariance: 0.1, // Low, assuming mostly single color line
  //     averageLineThickness: 2.0, // Typical line thickness
  //     dominantColors: ["#8B0000", "#FFFFFF"], // Reddish-brown for line, white for background
  //     specifications: {
  //       dimensions: "500 x 500 pixels",
  //       dotCount: 41,
  //       lineLength: "N/A", // As specified by user
  //       strokeWidth: "N/A", // As specified by user
  //     },
  //     algorithm: [
  //       "Dot Placement: Start with a central 5x5 staggered grid of dots. Add dots around this core to form the outer star shape, which results in a 9x9 maximal outer dimension of the dot arrangement.",
  //       "Looping Motif: The design uses a continuous looping line (Kambi) that travels around the dots.",
  //       "The core of the design uses S-shaped loops or figure-eights, encircling dots in groups of two.",
  //       "The lines create a square lattice structure at the center and a diamond lattice at the points.",
  //       "Connecting the Design: The loops are connected to form a single, continuous, closed-loop line that outlines a central square with surrounding symmetrical star points.",
  //     ],
  //     culturalSignificance: "The Kambi Kolam (Thread Kolam) is highly regarded in South Indian culture, particularly in Tamil Nadu. The single, continuous, closed line signifies infinity, unity, and completeness. It is often interpreted as a protective boundary, warding off evil spirits or negative energy. Drawing a Kolam at the doorstep is a daily ritual symbolizing auspiciousness (Mangalam), welcoming guests, and offering a meal (the rice flour) to ants and small creatures, which embodies the value of sharing and living in harmony with nature. Kolams like this one that combine a central form with outward-reaching points are common, representing the cosmos or the eight directions (Ashta Dikku), which is why they are often drawn during festivals.",
  //   };
  // };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        console.log("Image uploaded and state set:", result ? "Yes" : "No");
        setAnalysisResult(null);
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        console.log("Image dropped and state set:", result ? "Yes" : "No");
        setAnalysisResult(null);
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  // Initiates the image analysis process
  const analyzeImage = async () => {
    console.log("Analyze button clicked.");
    console.log("Current uploadedImage state:", uploadedImage ? "Image data exists" : "No image data");
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResult(null)
    setError(null)

    if (!uploadedImage) {
      setError("Please upload an image first.")
      setIsAnalyzing(false)
      console.error("AnalyzeImage: No image uploaded, returning early.");
      return
    }

    // Simulate analysis progress
    const progressSteps = [
      { step: 20, message: "Detecting patterns..." },
      { step: 40, message: "Analyzing symmetry..." },
      { step: 60, message: "Calculating dimensions..." },
      { step: 80, message: "Identifying cultural elements..." },
      { step: 100, message: "Generating report..." },
    ]

    for (const { step } of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 300)) // Reduced timeout for quicker simulation
      setAnalysisProgress(step)
    }

    try {
      const prompt = "Analyze this Kolam design. Provide a detailed mathematical and cultural analysis in a JSON format with the following keys:\n- `symmetryType`: (string) e.g., \"D4 Dihedral Symmetry\"\n- `rotationPatterns`: (array of strings) e.g., [\"90-degree rotational symmetry\"]\n- `gridSystem`: (string) e.g., \"Square Grid (Dot-based)\"\n- `complexity`: (string) e.g., \"Intermediate\", \"High\"\n- `symmetryScore`: (number, 0-1.0) Numerical score (0 if N/A).\n- `complexityIndex`: (number, 0-1.0) Numerical score (0 if N/A).\n- `dotDensity`: (number, 0-1.0) Numerical score (0 if N/A).\n- `lineSmoothness`: (number, 0-1.0) Numerical score (0 if N/A).\n- `colorVariance`: (number, 0-1.0) Numerical score (0 if N/A).\n- `averageLineThickness`: (number) Numerical value in pixels (0 if N/A).\n- `dominantColors`: (array of hex strings) e.g., [\"#FF0000\", \"#0000FF\"], or [\"N/A\"] if none.\n- `specifications`: (object with properties below)\n  - `dimensions`: (string) e.g., \"500 x 500 pixels\", \"N/A\" if not determinable.\n  - `dotCount`: (number) Integer count (0 if N/A).\n  - `lineLength`: (string) e.g., \"Approx. 1200 units\", \"N/A\" if not determinable.\n  - `strokeWidth`: (string) e.g., \"2px\", \"N/A\" if not determinable.\n- `algorithm`: (array of strings) Step-by-step description.\n- `culturalSignificance`: (string) Detailed explanation.\n\nEnsure all numerical fields are strictly numbers (0 for N/A), and string fields are concise ('N/A' for strings if truly not determinable). Do not include any additional text outside the JSON object. The response should be in a single JSON object."

      const response = await fetch("http://localhost:8000/gemini-analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_data: uploadedImage,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let finalAnalysis: AnalysisResult;
      if (typeof data.analysis === 'object' && data.analysis !== null) {
        // If backend already parsed it into an object, use it directly
        finalAnalysis = data.analysis as AnalysisResult;
      } else if (typeof data.analysis === 'string') {
        // If it's a string, try to parse it. If it fails, create a fallback.
        try {
          finalAnalysis = JSON.parse(data.analysis) as AnalysisResult;
        } catch (jsonError) {
          console.error("Failed to parse analysis string as JSON:", jsonError);
          // Fallback for non-JSON or malformed JSON responses
          finalAnalysis = {
            symmetryType: "N/A",
            rotationPatterns: ["N/A"],
            gridSystem: "N/A",
            complexity: "N/A",
            symmetryScore: 0,
            complexityIndex: 0,
            dotDensity: 0,
            lineSmoothness: 0,
            colorVariance: 0,
            averageLineThickness: 0,
            dominantColors: ["#CCCCCC"],
            specifications: {
              dimensions: "N/A",
              dotCount: 0,
              lineLength: "N/A",
              strokeWidth: "N/A",
            },
            algorithm: ["Raw response: " + data.analysis.substring(0, 200) + (data.analysis.length > 200 ? "..." : "")],
            culturalSignificance: "The AI returned content that could not be parsed as valid JSON. This might be a partial response or an error from the AI. Check the algorithm field for raw output.",
          };
        }
      } else {
        // Fallback for unexpected data types
        console.error("Unexpected analysis data type:", typeof data.analysis, data.analysis);
        finalAnalysis = {
          symmetryType: "N/A",
          rotationPatterns: ["N/A"],
          gridSystem: "N/A",
          complexity: "N/A",
          symmetryScore: 0,
          complexityIndex: 0,
          dotDensity: 0,
          lineSmoothness: 0,
          colorVariance: 0,
          averageLineThickness: 0,
          dominantColors: ["#CCCCCC"],
          specifications: {
            dimensions: "N/A",
            dotCount: 0,
            lineLength: "N/A",
            strokeWidth: "N/A",
          },
          algorithm: ["Unexpected data format from backend."],
          culturalSignificance: "The AI returned content in an unexpected format. Please try again or check backend logs.",
        };
      }
      setAnalysisResult(finalAnalysis);

    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Upload Kolam Image</CardTitle>
          <CardDescription>Upload a clear image of your Kolam design for detailed analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded Kolam"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                />  
                <p className="text-sm text-muted-foreground">Image uploaded successfully</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">
                    <label htmlFor="file-upload" className="cursor-pointer text-primary hover:text-primary/80">
                      Click to upload
                    </label>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          {/* Analyze Button */}
          {uploadedImage && (
            <Button onClick={analyzeImage} className="w-full">
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing Design...
                </>
              ) : (
                "Analyze Kolam Design"
              )}
            </Button>
          )}

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{analysisProgress}% complete</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}

          {/* Upload Tips */}
          <div className="bg-card rounded-lg p-4">
            <h4 className="font-medium text-card-foreground mb-2">Tips for accurate analysis:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use high-resolution images (minimum 500x500px)</li>
              <li>• Ensure good lighting and contrast</li>
              <li>• Center the Kolam in the frame</li>
              <li>• Avoid shadows or reflections</li>
              <li>• Clean, complete patterns work best</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Analysis Results</CardTitle>
          <CardDescription>Detailed mathematical and cultural analysis of your Kolam design</CardDescription>
        </CardHeader>
        <CardContent>
          {analysisResult ? (
            <div className="space-y-6">
              {/* Symmetry Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Symmetry Analysis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="secondary">{analysisResult.symmetryType}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground mb-2 block">Rotation Patterns:</span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.rotationPatterns && analysisResult.rotationPatterns.map((pattern, index) => (
                        <Badge key={index} variant="outline">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Symmetry Score:</span>
                    <Badge variant="outline">{(analysisResult.symmetryScore !== undefined) ? `${(analysisResult.symmetryScore * 100).toFixed(0)}%` : 'N/A'}</Badge>
                  </div>
                </div>
              </div>

              {/* Grid System */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Grid System</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Structure:</span>
                  <Badge>{analysisResult.gridSystem}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Dot Density:</span>
                  <Badge variant="outline">{(analysisResult.dotDensity !== undefined) ? `${(analysisResult.dotDensity * 100).toFixed(0)}%` : 'N/A'}</Badge>
                </div>
              </div>

              {/* Complexity */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Complexity Level</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <Badge variant={analysisResult.complexity === "Advanced" ? "destructive" : "default"}>
                    {analysisResult.complexity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Complexity Index:</span>
                  <Badge variant="outline">{(analysisResult.complexityIndex !== undefined) ? `${(analysisResult.complexityIndex * 100).toFixed(0)}%` : 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Line Smoothness:</span>
                  <Badge variant="outline">{(analysisResult.lineSmoothness !== undefined) ? `${(analysisResult.lineSmoothness * 100).toFixed(0)}%` : 'N/A'}</Badge>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Color Analysis</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Color Variance:</span>
                  <Badge variant="outline">{(analysisResult.colorVariance !== undefined) ? `${(analysisResult.colorVariance * 100).toFixed(0)}%` : 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Dominant Colors:</span>
                  <div className="flex gap-2">
                    {analysisResult.dominantColors && analysisResult.dominantColors.map((color, index) => (
                      <div key={index} className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Technical Specifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">{analysisResult.specifications?.dimensions || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dot Count:</span>
                    <span className="font-medium">{analysisResult.specifications?.dotCount || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Line Thickness:</span>
                    <span className="font-medium">{analysisResult.averageLineThickness !== undefined ? `${analysisResult.averageLineThickness.toFixed(1)}px` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated Line Length:</span>
                    <span className="font-medium">{analysisResult.specifications?.lineLength || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Algorithm */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Construction Algorithm</h3>
                <div className="space-y-2">
                  {analysisResult.algorithm && analysisResult.algorithm.map((step, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Significance */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Cultural Significance</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{analysisResult.culturalSignificance}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button onClick={handleDownloadReport} disabled={!analysisResult} className="flex-1 sm:flex-none">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Report
                </Button>
                <Button onClick={handleShareAnalysis} disabled={!analysisResult} variant="outline" className="flex-1 sm:flex-none bg-transparent">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share Analysis
                </Button>
                <Button onClick={handleRecreateDesign} disabled={!analysisResult} variant="secondary" className="flex-1 sm:flex-none">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Recreate Design
                </Button>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>Upload a Kolam image to see detailed analysis</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
