from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import svgwrite
import math
import os
import io
from PIL import Image
import base64
from dotenv import load_dotenv
import google.generativeai as genai
import json # Import the json module

load_dotenv() # Load environment variables from .env

app = FastAPI()

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=GEMINI_API_KEY)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kolamkars.vercel.app/", "http://localhost:3000"], # Updated to Vercel frontend URL and localhost for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class KolamParameters(BaseModel):
    design_type: str = "lsystem"
    axiom: str = "FBFBFBFB"
    rules: dict[str, str] = {"A": "AFBFA", "B": "AFBFBFBFA"}
    angle: int = 45
    dot_size: int = 10
    iterations: int = 2
    rhombus_size: int = 5 # New parameter for Kambi Kolam
    grid_size: int = 8 # New parameter for Group Theory Kolam
    polygon1_sides: int = 6 # New parameter for Group Theory Kolam
    polygon1_radius: int = 3 # New parameter for Group Theory Kolam
    polygon2_sides: int = 8 # New parameter for Group Theory Kolam
    polygon2_radius: int = 2 # New parameter for Group Theory Kolam

class ImageProcessRequest(BaseModel):
    image: str # Base64 encoded image string
    prompt: str = ""

class GeminiAnalysisRequest(BaseModel):
    image_data: str # Base64 encoded image string
    prompt: str

@app.post("/gemini-analyze-image")
async def gemini_analyze_image(request: GeminiAnalysisRequest):
    try:
        # Decode the base64 image data
        image_bytes = io.BytesIO(base64.b64decode(request.image_data.split(",")[-1]))
        img = Image.open(image_bytes)

        # Create a GenerativeModel instance with the correct model name
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        # Generate content with the model, including the image and prompt
        response = model.generate_content([request.prompt, img])

        # Preprocess Gemini's response text if it starts with "json "
        gemini_response_text = response.text.strip()
        
        # Strip "json " prefix if present
        if gemini_response_text.startswith("json "):
            gemini_response_text = gemini_response_text[len("json "):]
            
        # Strip markdown code block (```json) if present
        if gemini_response_text.startswith("```json"):
            gemini_response_text = gemini_response_text[len("```json\n"):].strip()
        if gemini_response_text.endswith("```"):
            gemini_response_text = gemini_response_text[:-len("```")].strip()
            
        # Attempt to parse Gemini's response as JSON
        try:
            parsed_gemini_response = json.loads(gemini_response_text)
            
            # If the initial parse results in a string, it means the JSON was double-escaped
            if isinstance(parsed_gemini_response, str):
                parsed_gemini_response = json.loads(parsed_gemini_response)
                
            return {"analysis": parsed_gemini_response} # Return as a JSON object
        except json.JSONDecodeError:
            # If not valid JSON, return as a raw string (frontend will handle this)
            return {"analysis": response.text}
    except Exception as e:
        import traceback
        return Response(content=f"Error in Gemini analysis: {e}\n{traceback.format_exc()}", media_type="text/plain", status_code=500)

@app.options("/gemini-analyze-image")
async def options_gemini_analyze_image():
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
    })

# Function to expand the L-System string (from kolampython.py)
def expand_lsystem_string(axiom, rules, iterations):
    result = axiom
    for _ in range(iterations):
        result = "".join([rules.get(ch, ch) for ch in result])
    return result

def generate_lsystem_kolam_svg(params: KolamParameters):
    dwg = svgwrite.Drawing('kolam.svg', profile='tiny', size=('600px', '600px'))
    dwg.add(dwg.rect(insert=(0, 0), size=('100%', '100%'), fill='white'))

    current_x, current_y = 300, 300
    current_angle = 0

    def draw_line_svg(length):
        nonlocal current_x, current_y, current_angle
        new_x = current_x + length * math.cos(math.radians(current_angle))
        new_y = current_y + length * math.sin(math.radians(current_angle))
        dwg.add(dwg.line(start=(current_x, current_y), end=(new_x, new_y), stroke='black', stroke_width=2))
        current_x, current_y = new_x, new_y

    def draw_arc_svg(radius, angle_degrees):
        nonlocal current_x, current_y, current_angle
        current_angle_rad = math.radians(current_angle)
        
        if radius > 0:
            center_angle_rad = current_angle_rad + math.pi / 2
        else:
            center_angle_rad = current_angle_rad - math.pi / 2
            radius = abs(radius)

        center_x = current_x + radius * math.cos(center_angle_rad)
        center_y = current_y + radius * math.sin(center_angle_rad)

        start_angle_rad = math.atan2(current_y - center_y, current_x - center_x)
        end_angle_rad = start_angle_rad + math.radians(angle_degrees)

        sweep_flag = 1 if radius > 0 else 0
        if angle_degrees < 0:
            sweep_flag = 1 - sweep_flag

        large_arc_flag = 1 if abs(angle_degrees) > 180 else 0

        end_x = center_x + radius * math.cos(end_angle_rad)
        end_y = center_y + radius * math.sin(end_angle_rad)

        path_data = f"M {current_x},{current_y} A {radius},{radius} 0 {large_arc_flag} {sweep_flag} {end_x},{end_y}"
        dwg.add(dwg.path(d=path_data, stroke='black', stroke_width=2, fill='none'))

        current_x, current_y = end_x, end_y
        current_angle += angle_degrees

    lsystem_string = expand_lsystem_string(params.axiom, params.rules, params.iterations)

    current_x = 300 - params.dot_size
    current_y = 300 + params.dot_size

    for symbol in lsystem_string:
        if symbol == "F":
            draw_line_svg(params.dot_size)
        elif symbol == "A":
            draw_arc_svg(params.dot_size, 90)
        elif symbol == "B":
            forward_units = 5 / (2 ** 0.5)
            draw_line_svg(forward_units)
            draw_arc_svg(forward_units, 270)

    return dwg.tostring()

def generate_suzhi_kolam_svg(params: KolamParameters):
    dwg = svgwrite.Drawing('suzhi_kolam.svg', profile='tiny', size=('600px', '600px'))
    dwg.add(dwg.rect(insert=(0, 0), size=('100%', '100%'), fill='white'))

    current_x, current_y = 300, 300
    current_angle = 0

    def draw_line_svg(length):
        nonlocal current_x, current_y, current_angle
        new_x = current_x + length * math.cos(math.radians(current_angle))
        new_y = current_y + length * math.sin(math.radians(current_angle))
        dwg.add(dwg.line(start=(current_x, current_y), end=(new_x, new_y), stroke='black', stroke_width=2))
        current_x, current_y = new_x, new_y

    def draw_arc_svg(radius, angle_degrees):
        nonlocal current_x, current_y, current_angle
        current_angle_rad = math.radians(current_angle)
        
        if radius > 0:
            center_angle_rad = current_angle_rad + math.pi / 2
        else:
            center_angle_rad = current_angle_rad - math.pi / 2
            radius = abs(radius)

        center_x = current_x + radius * math.cos(center_angle_rad)
        center_y = current_y + radius * math.sin(center_angle_rad)

        start_angle_rad = math.atan2(current_y - center_y, current_x - center_x)
        end_angle_rad = start_angle_rad + math.radians(angle_degrees)

        sweep_flag = 1 if radius > 0 else 0
        if angle_degrees < 0:
            sweep_flag = 1 - sweep_flag

        large_arc_flag = 1 if abs(angle_degrees) > 180 else 0

        end_x = center_x + radius * math.cos(end_angle_rad)
        end_y = center_y + radius * math.sin(end_angle_rad)

        path_data = f"M {current_x},{current_y} A {radius},{radius} 0 {large_arc_flag} {sweep_flag} {end_x},{end_y}"
        dwg.add(dwg.path(d=path_data, stroke='black', stroke_width=2, fill='none'))

        current_x, current_y = end_x, end_y
        current_angle += angle_degrees

    lsystem_string = expand_lsystem_string(params.axiom, params.rules, params.iterations)

    current_x = 300 - params.dot_size
    current_y = 300 + params.dot_size

    for symbol in lsystem_string:
        if symbol == "F":
            draw_line_svg(params.dot_size)
        elif symbol == "A":
            draw_arc_svg(params.dot_size, 90)
        elif symbol == "B":
            forward_units = 5 / (2 ** 0.5)
            draw_line_svg(forward_units)
            draw_arc_svg(forward_units, 270)

    return dwg.tostring()

def generate_kambi_kolam_svg(params: KolamParameters):
    dwg = svgwrite.Drawing('kambi_kolam.svg', profile='tiny', size=('600px', '600px'))
    dwg.add(dwg.rect(insert=(0, 0), size=('100%', '100%'), fill='white'))

    current_x, current_y = 300, 300
    current_angle = 0

    # Calculate the side length of the rhombus based on the dot size and rhombus size
    rhombus_side = params.rhombus_size * params.dot_size

    # Set up the initial position (adjusting for SVG coordinate system)
    current_x = 300 - rhombus_side / 2
    current_y = 300 + rhombus_side / 2

    def draw_line_svg(length):
        nonlocal current_x, current_y, current_angle
        new_x = current_x + length * math.cos(math.radians(current_angle))
        new_y = current_y + length * math.sin(math.radians(current_angle))
        dwg.add(dwg.line(start=(current_x, current_y), end=(new_x, new_y), stroke='black', stroke_width=2))
        current_x, current_y = new_x, new_y

    def draw_arc_svg(radius, angle_degrees):
        nonlocal current_x, current_y, current_angle
        current_angle_rad = math.radians(current_angle)
        
        if radius > 0:
            center_angle_rad = current_angle_rad + math.pi / 2
        else:
            center_angle_rad = current_angle_rad - math.pi / 2
            radius = abs(radius)

        center_x = current_x + radius * math.cos(center_angle_rad)
        center_y = current_y + radius * math.sin(center_angle_rad)

        start_angle_rad = math.atan2(current_y - center_y, current_x - center_x)
        end_angle_rad = start_angle_rad + math.radians(angle_degrees)

        sweep_flag = 1 if radius > 0 else 0
        if angle_degrees < 0:
            sweep_flag = 1 - sweep_flag

        large_arc_flag = 1 if abs(angle_degrees) > 180 else 0

        end_x = center_x + radius * math.cos(end_angle_rad)
        end_y = center_y + radius * math.sin(end_angle_rad)

        path_data = f"M {current_x},{current_y} A {radius},{radius} 0 {large_arc_flag} {sweep_flag} {end_x},{end_y}"
        dwg.add(dwg.path(d=path_data, stroke='black', stroke_width=2, fill='none'))

        current_x, current_y = end_x, end_y
        current_angle += angle_degrees

    lsystem_string = expand_lsystem_string(params.axiom, params.rules, params.iterations)

    for symbol in lsystem_string:
        if symbol == "F":
            draw_line_svg(params.dot_size)
        elif symbol == "A":
            draw_arc_svg(params.dot_size, 90)
        elif symbol == "B":
            forward_units = 5 / (2 ** 0.5)
            draw_line_svg(forward_units)
            draw_arc_svg(forward_units, 270)

    return dwg.tostring()

def create_polygon_svg(center, sides, radius, dwg, offset_x, offset_y):
    angle = 2 * math.pi / sides
    points = []
    for i in range(sides):
        x = center[0] + radius * math.cos(i * angle)
        y = center[1] + radius * math.sin(i * angle)
        points.append((x + offset_x, y + offset_y))
    
    points_str = " ".join([f"{p[0]},{p[1]}" for p in points])
    dwg.add(dwg.polygon(points=points, stroke='black', fill='none', stroke_width=2))

def generate_grouptheory_kolam_svg(params: KolamParameters):
    dwg = svgwrite.Drawing('grouptheory_kolam.svg', profile='tiny', size=('800px', '800px'))
    dwg.add(dwg.rect(insert=(0, 0), size=('100%', '100%'), fill='white'))

    center_x, center_y = 400, 400 # Center of the 800x800 canvas
    scale_factor = 40 # Corresponds to the 40 used in the python turtle example

    def get_polygon_points(sides, radius):
        local_points = []
        angle_step = 2 * math.pi / sides
        for i in range(sides):
            x = radius * math.cos(i * angle_step)
            y = radius * math.sin(i * angle_step)
            local_points.append((x, y))
        return local_points

    polygon1_local = get_polygon_points(params.polygon1_sides, params.polygon1_radius)
    polygon2_local = get_polygon_points(params.polygon2_sides, params.polygon2_radius)

    grid_offset_x = center_x - (params.grid_size - 1) * scale_factor / 2
    grid_offset_y = center_y - (params.grid_size - 1) * scale_factor / 2

    for r_idx in range(params.grid_size):
        for c_idx in range(params.grid_size):
            current_polygon_local = polygon1_local if (r_idx + c_idx) % 2 == 0 else polygon2_local
            
            # Calculate the position for each polygon based on grid index
            offset_x = grid_offset_x + c_idx * scale_factor
            offset_y = grid_offset_y + r_idx * scale_factor

            points_for_svg = []
            for px, py in current_polygon_local:
                points_for_svg.append((offset_x + px * scale_factor / 3, offset_y + py * scale_factor / 3))
            
            if points_for_svg:
                points_str = " ".join([f"{p[0]},{p[1]}" for p in points_for_svg])
                dwg.add(dwg.polygon(points=points_for_svg, stroke='black', fill='none', stroke_width=1))

    return dwg.tostring()

@app.post("/generate-from-image")
async def generate_kolam_from_image(request: ImageProcessRequest):
    try:
        # Here you would add your image processing logic
        # For now, let's return a simple static SVG or an error indicating it's not implemented
        # In a real scenario, you'd decode the base64 image, process it, and generate a kolam SVG

        # Placeholder: return a simple SVG
        svg_data = """
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="200" height="200" fill="#f0f0f0"/>
  <circle cx="100" cy="100" r="80" stroke="#333" stroke-width="2" fill="none"/>
  <text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#333" text-anchor="middle" alignment-baseline="middle">Generated from Image (Placeholder)</text>
</svg>
        """
        return Response(content=svg_data, media_type="image/svg+xml")
    except Exception as e:
        import traceback
        return Response(content=f"<svg><text x=\"10\" y=\"20\" fill=\"red\">Error: {e}\n{traceback.format_exc()}</text></svg>", media_type="image/svg+xml", status_code=500)

@app.options("/generate-from-image")
async def options_generate_kolam_from_image():
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400" # Cache preflight response for 24 hours
    })

@app.post("/analyze-kolam-image")
async def analyze_kolam_image(request: ImageProcessRequest):
    try:
        # The user's requested hardcoded prompt for Kambi Kolam
        user_prompt = '''
Analyze the provided Kolam design image. Generate a detailed mathematical and cultural analysis in JSON format. The JSON must adhere to the following structure and content guidelines, inferring all details from the image:

{
  "symmetryType": "<Inferred symmetry type, e.g., Mathematical Analysis, D4 Dihedral Symmetry>",
  "rotationPatterns": [
    "<Describe specific rotation patterns, e.g., 90-degree Rotational Symmetry, 180-degree Rotational Symmetry>",
    "<Add more patterns as applicable, or 'No specific pattern found' if none>"
  ],
  "gridSystem": "<Inferred grid system, e.g., Pulli Kolam (Kambi Kolam), Square Grid, Hexagonal Grid>",
  "complexity": "<Inferred complexity level: e.g., Beginner, Intermediate, Advanced>",
  "specifications": {
    "dimensions": "<Image dimensions, e.g., 500 x 500 pixels>",
    "dotCount": <Inferred dot count, or 0 if N/A>,
    "lineLength": "<Estimated total line length, or 'N/A'>",
    "strokeWidth": "<Estimated average stroke width, or 'N/A'>"
  },
  "algorithm": [
    "<Step-by-step description of how the Kolam appears to be constructed>",
    "<Add more steps as detailed as possible>"
  ],
  "culturalSignificance": "<Detailed explanation of the cultural significance and symbolism of the Kolam design, its elements, and its context>"
}

For `symmetryType`, provide a precise mathematical description if identifiable. For `rotationPatterns`, list all identifiable rotational and reflectional symmetries. For `gridSystem`, identify the underlying grid structure. For `complexity`, assign a level based on intricacy. For `specifications`, infer these details from the image; provide 'N/A' for strings or 0 for numbers if exact values cannot be determined. For `algorithm`, describe the likely construction method. For `culturalSignificance`, give a comprehensive cultural context. Ensure all arrays are populated with relevant information or a single 'N/A' entry if no patterns are found. Do not include any additional text outside the JSON object.
        '''
        # Call the Gemini analysis endpoint with the image and prompt
        gemini_response = await gemini_analyze_image(GeminiAnalysisRequest(image_data=request.image, prompt=user_prompt))
        return gemini_response
    except Exception as e:
        import traceback
        return Response(content=f"Error: {e}\n{traceback.format_exc()}", media_type="text/plain", status_code=500)

@app.options("/analyze-kolam-image")
async def options_analyze_kolam_image():
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400" # Cache preflight response for 24 hours
    })

@app.post("/generate-kolam-svg")
async def generate_kolam_design(params: KolamParameters):
    try:
        if params.design_type == "lsystem":
            svg_data = generate_lsystem_kolam_svg(params)
        elif params.design_type == "suzhi":
            svg_data = generate_suzhi_kolam_svg(params)
        elif params.design_type == "kambi":
            svg_data = generate_kambi_kolam_svg(params)
        elif params.design_type == "grouptheory":
            svg_data = generate_grouptheory_kolam_svg(params)
        else:
            return Response(content=f"<svg><text x=\"10\" y=\"20\" fill=\"red\">Error: Unknown design type {params.design_type}</text></svg>", media_type="image/svg+xml", status_code=400)
        return Response(content=svg_data, media_type="image/svg+xml")
    except Exception as e:
        import traceback
        return Response(content=f"<svg><text x=\"10\" y=\"20\" fill=\"red\">Error: {e}\n{traceback.format_exc()}</text></svg>", media_type="image/svg+xml", status_code=500)

@app.options("/generate-kolam-svg")
async def options_generate_kolam_design():
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400" # Cache preflight response for 24 hours
    })
