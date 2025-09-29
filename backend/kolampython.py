import turtle
from PIL import Image
import io

# L-System parameters
axiom = "FBFBFBFB"  # Initiator
rules = {
    "A": "AFBFA",
    "B": "AFBFBFBFA"
}
angle = 45  # Angle in degrees

# Function to expand the L-System string
def expand_lsystem_string(axiom, rules, iterations):
    result = axiom
    for _ in range(iterations):
        result = "".join([rules.get(ch, ch) for ch in result])
    return result

def draw_suzhi_kolam(lsystem_string, dot_size, turtle_obj, screen_obj):
    turtle_obj.speed(0)  # Set the turtle's speed (0 is the fastest)

    # Set up the initial position
    turtle_obj.penup()
    turtle_obj.goto(-dot_size, dot_size)
    turtle_obj.pendown()

    # Interpret the L-System string
    for symbol in lsystem_string:
        if symbol == "F":
            draw_line(dot_size, turtle_obj)
        elif symbol == "A":
            draw_arc(dot_size, 90, turtle_obj)
        elif symbol == "B":
            forward_units = 5 / (2 ** 0.5)
            turtle_obj.forward(forward_units)
            draw_arc(forward_units, 270, turtle_obj)

def draw_line(length, turtle_obj):
    turtle_obj.forward(length)

def draw_arc(radius, angle, turtle_obj):
    turtle_obj.circle(radius, angle)

def generate_kolam_image(axiom, rules, angle, dot_size, iterations):
    screen = turtle.Screen()
    screen.setup(width=600, height=600)
    screen.tracer(0) # Turn off screen updates for faster drawing

    t = turtle.Turtle()
    t.hideturtle()

    lsystem_string = expand_lsystem_string(axiom, rules, iterations)
    draw_suzhi_kolam(lsystem_string, dot_size, t, screen)

    # Save to PostScript
    ps_buffer = io.BytesIO()
    screen.getcanvas().postscript(file=ps_buffer)

    # Convert PostScript to PNG
    ps_buffer.seek(0)
    img = Image.open(ps_buffer)
    
    # Save PNG to a bytes buffer
    png_buffer = io.BytesIO()
    img.save(png_buffer, format="PNG")
    png_buffer.seek(0)
    
    # Clean up turtle environment
    # screen.bye()
    
    return png_buffer.getvalue()

if __name__ == '__main__':
    axiom = "FBFBFBFB"
    rules = {
        "A": "AFBFA",
        "B": "AFBFBFBFA"
    }
    angle = 45
    dot_size = 10
    iterations = 2
    
    png_data = generate_kolam_image(axiom, rules, angle, dot_size, iterations)
    with open("kolam_output.png", "wb") as f:
        f.write(png_data)
    print("Kolam generated and saved as kolam_output.png")

