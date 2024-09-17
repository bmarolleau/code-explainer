from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  # Import the CORS middleware
import requests
import json
import base64

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # You can replace "*" with your allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict HTTP methods as needed (e.g., ["GET", "POST"])
    allow_headers=["*"],  # You can specify allowed headers
)


class CodeGenerationRequest(BaseModel):
    api_key: str
    model_id: str
    input: str
    parameters: dict
    data: dict
    

@app.post("/v1/explain")
async def generate_code(request_data: CodeGenerationRequest):
    url = "https://bam-api.res.ibm.com/v2/text/generation?version=2024-09-13"

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {request_data.api_key}',
    }
    request_data.__delattr__('api_key')
    #print("HEADERS: "+ headers.__str__)
    #print(request_data.model_dump_json())

    response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
    print(response.json())
    return response.json()['results'][0]['generated_text']

@app.post("/v1/wca4z-explain")
async def generate_code2(request_data: CodeGenerationRequest):
    url = "https://iam.cloud.ibm.com/identity/token"

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
       # 'Authorization': f'Bearer {request_data.api_key}',
    }

    print(request_data.model_dump_json())


    request_data2="grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey="+request_data.api_key
    #request_data.__delattr__('api_key')
    #print("HEADERS: "+ headers.__str__)
    #print(request_data.model_dump_json())

    response = requests.request("POST", url, headers=headers, data=request_data2.model_dump_json())
    print("RESP="+response.json())
    token=response.json().access_token
    print("TOKEN="+token)

    url = "https://api.dataplatform.cloud.ibm.com/v1/wca/code/explanation/COBOL?level=DETAILED"

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'user-agent' : 'zCodeAssistant/2.1.0' 
    }

    #code = request_data.model_dump_json().source_code.encode('ascii')
    #sourceb64 = base64.b64encode(code)
    #request_data="{source_code:"+sourceb64+"}"
    
    response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
    print("RESP2="+response.json())
    token=response.json().access_token
    print("TOKEN2="+token)

    return response.json()['results'][0]['generated_text']


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="127.0.0.1", port=8080, log_level="debug")
