from fastapi import FastAPI
from pydantic import BaseModel
#from fastapi.middleware.cors import CORSMiddleware  # Import the CORS middleware
from starlette.middleware.cors import CORSMiddleware
import requests
import json
import base64
import os.path
import tarfile
from fastapi.staticfiles import StaticFiles

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # You can replace "*" with your allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict HTTP methods as needed (e.g., ["GET", "POST"])
    allow_headers=["*"],  # You can specify allowed headers
)
script_dir = os.path.dirname(__file__)
st_abs_file_path = os.path.join(script_dir, "public/")
app.mount ('/static', StaticFiles(directory=st_abs_file_path), name="static")

class CodeGenerationRequest(BaseModel):
    api_key: str
    model_id: str
    input: str
    parameters: dict
    data: dict
    
class CodeExplainWCAZ(BaseModel):
    api_key: str
    source_code: str
    level: str

class FileUpload(BaseModel):
    file_name: str
    source_code: bytes
    

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
async def generate_code2(request_data: CodeExplainWCAZ, batchmode: str = "false"):
    #************************************** 
    # Get Bearer Token generation from API Key:
    #**************************************
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',     
    }
    #print(request_data.model_dump_json())
    request_data2="grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey="+request_data.api_key
    response = requests.request("POST", url, headers=headers, data=request_data2)
    json_data = response.json()
    token=json_data['access_token']

    ## IF BATCH MODE , LET'S USE UPLOADED FILES
    #print(batchmode)

    if (batchmode == "true"): 
        save_path = 'public'
        basedir = os.path.abspath(os.path.dirname(__file__)) 
        import glob
        files = glob.glob(os.path.join(basedir,save_path)    )
        directory = os.fsencode(os.path.join(basedir,save_path))
        source_code=""
        output=""
        level=request_data.level
        request_data.__delattr__('api_key')
        request_data.__delattr__('level')
        for fname in os.listdir(directory):
            #fullpath = os.path.join(basedir,save_path, file_name) 
            #print("FILE: _____"+fname.decode('utf-8'))
            if ( fname.decode('utf-8').endswith(".cbl") or fname.decode('utf-8').endswith(".CBL")) :

                with open(os.path.join(basedir,save_path,fname.decode('utf-8')), 'r') as f:
                    source_code=base64.b64encode(f.read().encode('utf-8'))
                    request_data.__setattr__('source_code', source_code)
                    f.close()
                #***************************************************************** 
                # Invoke WCAZ Explain API:  input= Level, base64 code, bearer token
                #*****************************************************************
                # First lets extract the input Level: SIMPLE, DETAILED, GUIDED
                # print("bearer token="+token)
            
                url = "https://api.dataplatform.cloud.ibm.com/v1/wca/code/explanation/COBOL?level="+level
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {token}',
                    'user-agent' : 'zCodeAssistant/2.1.0' 
                }
                #Remove API Key and Level passed in the POST data part of the initial request 
            
                print(request_data.model_dump_json())
                response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
                json_data = response.json()
                print(response.json())
                code=json_data['generated_text']
                origin_file_name=fname.decode('utf-8')
                file_name=fname.decode('utf-8')+"_expl.txt"
                save_path = 'public'
                basedir = os.path.abspath(os.path.dirname(__file__))
                fullpath = os.path.join(basedir,save_path, file_name) 
                print("fullpath:"+fullpath)         
                file1 = open(fullpath, "w+")
                output+= "CODE EXPLANATION BY WCA4Z - "+origin_file_name+"\n"+code +"\n\n"
                file1.write("CODE EXPLANATION BY WCA4Z - "+origin_file_name+"\n"+code +"\n\n")
                file1.close()
        import time
        timestr = time.strftime("%Y%m%d-%H%M%S")
        tar = tarfile.open(os.path.join(basedir,'public',"explanations-"+timestr+".tar.gz"), "w:gz")   
        for fname in os.listdir(directory):
            print("FNAME:"+fname.decode('utf-8'))
            if ( fname.decode('utf-8').endswith(".txt") ) :
                basedir = os.path.abspath(os.path.dirname(__file__))
                fullpath = os.path.join(basedir,'public', fname.decode('utf-8')) 
                tar.add(fullpath, arcname="explanations-"+os.path.basename(fullpath))
        tar.close()
        return {"generated_text": output, "archive" : os.path.basename(tar.name)}
  
    #***************************************************************** 
    # Invoke WCAZ Explain API:  input= Level, base64 code, bearer token
    #*****************************************************************
    # First lets extract the input Level: SIMPLE, DETAILED, GUIDED
    # print("bearer token="+token)
    level=request_data.level
    url = "https://api.dataplatform.cloud.ibm.com/v1/wca/code/explanation/COBOL?level="+level
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'user-agent' : 'zCodeAssistant/2.1.0' 
    }
    #Remove API Key and Level passed in the POST data part of the initial request 
    request_data.__delattr__('api_key')
    request_data.__delattr__('level')
    response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
    json_data = response.json()
    print(response.json())
    code=json_data['generated_text']
    return code


@app.post("/v1/uploadfile")
async def upload_file(request_data: FileUpload):
    
    file_name=request_data.file_name
    source_code= base64.b64decode(request_data.source_code).decode('utf-8')
    save_path = 'public'
    basedir = os.path.abspath(os.path.dirname(__file__))
    fullpath = os.path.join(basedir,save_path, file_name)  
    import glob
    files = glob.glob(fullpath)
    print(files)
    for f in files:
        print("FILETODELETE:"+f)
        os.remove( f)         
    file1 = open(fullpath, "w+")
    file1.write(source_code)
    file1.close()

    return {"Result": "OK"}

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="127.0.0.1", port=8080, log_level="debug")
