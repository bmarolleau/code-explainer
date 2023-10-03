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
    api_key: str
    model_id: str
    inputs: list[str]
    parameters: dict


@app.post("/v1/generate")
async def generate_code(request_data: CodeGenerationRequest):
    url = "https://bam-api.res.ibm.com/v1/generate"

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {request_data.api_key}',
    }
    request_data.__delattr__('api_key')
    response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
    
    return response.json()['results'][0]['generated_text']


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="127.0.0.1", port=8080)
