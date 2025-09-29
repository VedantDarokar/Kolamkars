"use client"

import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KolamCanvas } from "@/components/kolam-canvas"

export function GenerateFromImage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedKolamSvg, setGeneratedKolamSvg] = useState<string | null>(null) // New state for generated SVG
  const [error, setError] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)

  // Function to save SVG as a file
  const saveSvgAsFile = () => {
    if (generatedKolamSvg) {
      const blob = new Blob([generatedKolamSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kolam_from_image.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Function to save SVG as PNG
  const saveSvgAsPng = () => {
    if (generatedKolamSvg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgBlob = new Blob([generatedKolamSvg], { type: 'image/svg+xml;charset=utf-8' });
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
        a.download = 'kolam_from_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = url;
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
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
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const processImage = async () => {
    setIsProcessing(true)
    setGeneratedKolamSvg(null)
    setError(null)

    if (!uploadedImage) {
      setError("Please upload an image first.")
      setIsProcessing(false)
      return
    }

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate client-side processing

      // Simplified client-side processing: just use the uploaded image as the "generated" SVG/image.
      // In a real scenario, complex image processing (e.g., edge detection, vectorization) would happen here.
      setGeneratedKolamSvg(uploadedImage);

    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeUploaded = async () => {
    if (!generatedKolamSvg && !uploadedImage) return
    setAnalysisLoading(true)
    setAnalysisError(null)
    setAnalysisResult(null)
    try {
      // If generatedKolamSvg is an SVG string, keep as-is; if it's a data URL, use directly
      const imageData = generatedKolamSvg || uploadedImage!
      const response = await fetch("https://kolamkars.onrender.com/analyze-kolam-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, prompt: "" }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text}`)
      }
      const json = await response.json()
      setAnalysisResult(json?.analysis ?? json)
    } catch (e: any) {
      setAnalysisError(e.message || 'Failed to analyze image')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const renderAnalysis = (data: any) => {
    let obj: any = data;
    if (typeof data === 'string') {
      try {
        const trimmed = data.trim().replace(/^```json\n?|```$/g, '');
        obj = JSON.parse(trimmed);
      } catch {
        return (
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Analysis</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{data}</p>
          </div>
        );
      }
    }

    if (!obj || typeof obj !== 'object') {
      return (
        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Analysis</h4>
          <p className="text-muted-foreground whitespace-pre-wrap">{String(obj)}</p>
        </div>
      );
    }

    const specs = obj.specifications || {};
    const rotation = Array.isArray(obj.rotationPatterns) ? obj.rotationPatterns : [];
    const algo = Array.isArray(obj.algorithm) ? obj.algorithm : [];

    return (
      <div className="space-y-3 text-sm">
        <h4 className="font-medium">Analysis</h4>
        {obj.symmetryType && (
          <div>
            <span className="font-medium">Symmetry Type: </span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground/80 border">{obj.symmetryType}</span>
          </div>
        )}
        {rotation.length > 0 && (
          <div>
            <span className="font-medium">Rotation Patterns:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {rotation.map((r: any, idx: number) => (
                <span key={idx} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground/80 border">{String(r)}</span>
              ))}
            </div>
          </div>
        )}
        {obj.gridSystem && (
          <div>
            <span className="font-medium">Grid System: </span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground/80 border">{obj.gridSystem}</span>
          </div>
        )}
        {obj.complexity && (
          <div>
            <span className="font-medium">Complexity: </span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground/80 border">{obj.complexity}</span>
          </div>
        )}
        {(specs.dimensions || specs.dotCount !== undefined || specs.lineLength || specs.strokeWidth) && (
          <div>
            <span className="font-medium">Specifications:</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground mt-1">
              {specs.dimensions && (
                <div>
                  <span className="font-medium text-foreground">Dimensions: </span>{specs.dimensions}
                </div>
              )}
              {specs.dotCount !== undefined && (
                <div>
                  <span className="font-medium text-foreground">Dot Count: </span>{specs.dotCount}
                </div>
              )}
              {specs.lineLength && (
                <div>
                  <span className="font-medium text-foreground">Line Length: </span>{specs.lineLength}
                </div>
              )}
              {specs.strokeWidth && (
                <div>
                  <span className="font-medium text-foreground">Stroke Width: </span>{specs.strokeWidth}
                </div>
              )}
            </div>
          </div>
        )}
        {algo.length > 0 && (
          <div>
            <span className="font-medium">Algorithm:</span>
            <ol className="list-decimal ml-5 text-muted-foreground">
              {algo.map((step: any, idx: number) => (
                <li key={idx}>{String(step)}</li>
              ))}
            </ol>
          </div>
        )}
        {obj.culturalSignificance && (
          <div>
            <span className="font-medium">Cultural Significance:</span>
            <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{obj.culturalSignificance}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Upload Your Sketch</CardTitle>
          <CardDescription>
            Upload a rough sketch or image of a Kolam design to generate a digital version
          </CardDescription>
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
                  alt="Uploaded sketch"
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

          {/* Process Button */}
          {uploadedImage && (
            <Button onClick={processImage} disabled={isProcessing} className="w-full">
              {isProcessing ? (
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
                  Processing Image...
                </>
              ) : (
                "Generate Digital Kolam"
              )}
            </Button>
          )}

          {/* Upload Tips */}
          <div className="bg-card rounded-lg p-4">
            <h4 className="font-medium text-card-foreground mb-2">Tips for best results:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use clear, high-contrast images</li>
              <li>• Ensure the sketch is well-lit</li>
              <li>• Simple line drawings work best</li>
              <li>• Avoid cluttered backgrounds</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Generated Design Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Generated Design</CardTitle>
          <CardDescription>Your digitized Kolam pattern will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedKolamSvg ? (
            <KolamCanvas kolamSvg={generatedKolamSvg} parameters={{
              gridType: "square", // These parameters are placeholders when generating from image
              rows: 6,
              columns: 6,
              dotSpacing: 25,
              strokeType: "continuous",
              symmetryType: "4-fold",
              iterations: 1,
            }} />
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
                <p>Upload an image to generate your Kolam design</p>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}

          {generatedKolamSvg && (
            <>              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={saveSvgAsFile} disabled={!generatedKolamSvg} className="flex-1 sm:flex-none">
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
                <Button onClick={saveSvgAsPng} disabled={!generatedKolamSvg} variant="outline" className="flex-1 sm:flex-none bg-transparent">
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
                <Button variant="secondary" className="flex-1 sm:flex-none" onClick={analyzeUploaded} disabled={analysisLoading || !(generatedKolamSvg || uploadedImage)}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round" 
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {analysisLoading ? 'Analyzing…' : 'Analyze This'}
                </Button>
              </div>

              {(analysisError || analysisResult) && (
                <div className="mt-4 p-3 rounded-md border bg-muted/30">
                  {analysisError && (
                    <p className="text-red-500 text-sm">Error: {analysisError}</p>
                  )}
                  {analysisResult && renderAnalysis(analysisResult)}
                </div>
              )}

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
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
