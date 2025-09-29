from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import traceback
import multiprocessing
import queue
from kolampython import generate_kolam_image

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

def kolam_generation_worker(axiom, rules, angle, dot_size, iterations, result_queue):
    try:
        png_data = generate_kolam_image(axiom, rules, angle, dot_size, iterations)
        result_queue.put({"image": png_data})
    except Exception as e:
        result_queue.put({"error": str(e), "traceback": traceback.format_exc()})

@app.route('/generate-kolam', methods=['POST'])
def generate_kolam():
    data = request.get_json()
    
    axiom = data.get("axiom", "FBFBFBFB")
    rules = data.get("rules", {"A": "AFBFA", "B": "AFBFBFBFA"})
    angle = data.get("angle", 45)
    dot_size = data.get("dot_size", 10)
    iterations = data.get("iterations", 2)
    
    result_queue = multiprocessing.Queue()
    process = multiprocessing.Process(
        target=kolam_generation_worker,
        args=(axiom, rules, angle, dot_size, iterations, result_queue)
    )
    process.start()
    
    try:
        # Wait for the process to complete with a timeout
        result = result_queue.get(timeout=30) # 30-second timeout
        
        if "image" in result:
            png_data = result["image"]
            encoded_image = base64.b64encode(png_data).decode('utf-8')
            return jsonify({"image": encoded_image}), 200
        else:
            # An error occurred in the worker process
            app.logger.error("Error from kolam generation worker: %s", result["traceback"])
            return jsonify({"error": result["error"], "traceback": result["traceback"]}), 500
            
    except queue.Empty:
        process.terminate()
        process.join()
        error_msg = "Kolam generation timed out."
        app.logger.error(error_msg)
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        app.logger.error("Error in main Flask process: %s", traceback.format_exc())
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500
    finally:
        if process.is_alive():
            process.terminate()
            process.join()

if __name__ == '__main__':
    # This is important for multiprocessing on Windows
    multiprocessing.freeze_support()
    app.run(debug=True)
