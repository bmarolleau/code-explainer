from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  # Import the CORS middleware
import requests
import json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace "*" with your allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict HTTP methods as needed (e.g., ["GET", "POST"])
    allow_headers=["*"],  # You can specify allowed headers
)


class CodeGenerationRequest(BaseModel):
    model_id: str
    inputs: list[str]
    parameters: dict


@app.post("/v1/generate")
async def generate_code(request_data: CodeGenerationRequest):
    url = "https://bam-api.res.ibm.com/v1/generate"
    
    # payload = json.dumps({
    #     "model_id": "codellama/codellama-34b-instruct",
    #     "inputs": [
    #         "Translate this Cobol code into Java.\nCobol:\n*> setup the identification division\nIDENTIFICATION DIVISION.\n*> setup the program id\nPROGRAM-ID. HELLO.\n*> setup the procedure division (like 'main' function)\nPROCEDURE DIVISION.\n*> print a string\nDISPLAY 'WILLKOMMEN'.\n*> end our program\nSTOP RUN.\nJava:\npublic class Hello {\npublic static void main(String[] args) {\nSystem.out.println(\"WILLKOMMEN\");\n}\n}\n\nAnswer:\n\n\\begin{code}\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"WILLKOMMEN\");\n    }\n}\n\\end{code}\n\nAnswer: \\begin{code}\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"WILLKOMMEN\");\n    }\n}\n\\end{code}"
    #     ],
    #     "parameters": {
    #         "decoding_method": "greedy",
    #         "stop_sequences": [
    #             "\\n\\n"
    #         ],
    #         "min_new_tokens": 1,
    #         "max_new_tokens": 200,
    #         "moderations": {
    #             "hap": {
    #                 "input": True,
    #                 "threshold": 0.75,
    #                 "output": True
    #             }
    #         }
    #     }
    # })
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer pak-LqER53LspelBxJbRsvIX2XmqLumCHkG8AW83QZo-8Ys',
    }
    
    response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
    
    return response.json()['results'][0]['generated_text']


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="127.0.0.1", port=8080)
