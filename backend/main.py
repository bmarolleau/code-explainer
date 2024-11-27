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

class CodeGenerationRequestIBMCloud(BaseModel):
    api_key: str
    model_id: str
    input: str
    parameters: dict
    project_id : str
    data: dict

class CodeExplainWCAZ(BaseModel):
    api_key: str
    source_code: str
    level: str

class FileUpload(BaseModel):
    file_name: str
    source_code: bytes

class FolderName(BaseModel):
    folder_name: str


@app.post("/v2/explain")
async def generate_code_ic(request_data: CodeGenerationRequestIBMCloud, batchmode: str = "false"):
    
    url="https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
    token=get_bearer_token(request_data.api_key)
    #print("IBMCLOUD MODE "+ token)
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
    }
    
    request_data.__delattr__('api_key')
    #print("HEADERS: "+ headers.__str__)
    print(request_data.model_dump_json())
    if (batchmode == "true"): 
        save_path = 'public'
        basedir = os.path.abspath(os.path.dirname(__file__)) 
        import glob
        files = glob.glob(os.path.join(basedir,save_path)    )
        directory = os.fsencode(os.path.join(basedir,save_path))
        source_code=""
        output=""
        #level=request_data.level
        #request_data.__delattr__('api_key')
        for fname in os.listdir(directory):
            #fullpath = os.path.join(basedir,save_path, file_name) 
            #print("FILE: _____"+fname.decode('utf-8'))
            if ( fname.decode('utf-8').endswith(".cbl") or fname.decode('utf-8').endswith(".CBL")) :

                with open(os.path.join(basedir,save_path,fname.decode('utf-8')), 'r') as f:
                    source_code=f.read()  #.encode('utf-8')
                    ##print("Source Code to explain: "+source_code)
                    prompt=json.dumps(request_data.data['PROMPT'])
                    #print("prompt1: "+prompt)
                    prompt=prompt.replace("{{SOURCE_CODE}}", source_code)
                    #print("prompt2: "+prompt)
                    request_data.__setattr__('input', prompt)
                    print(request_data.model_dump_json())
                    f.close()
                #***************************************************************** 
                # Invoke WX API:  input=  bearer token ,  code
                #*****************************************************************
            
                response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
                print(response.json())
                code=response.json()['results'][0]['generated_text'].replace('\\n', '\n')
                origin_file_name=fname.decode('utf-8')
                file_name=fname.decode('utf-8')+"_expl.txt"
                save_path = 'public'
                basedir = os.path.abspath(os.path.dirname(__file__))
                fullpath = os.path.join(basedir,save_path, file_name) 
                print("fullpath:"+fullpath)         
                file1 = open(fullpath, "w+")
                output+= "CODE EXPLANATION BY WX.AI - "+origin_file_name+"\n"+code +"\n\n"
                file1.write("CODE EXPLANATION BY WX.AI - "+origin_file_name+"\n"+code +"\n\n")
                file1.close()
        import time
        timestr = time.strftime("%Y%m%d-%H%M%S")
        tar = tarfile.open(os.path.join(basedir,'public',"explanations-wx-"+timestr+".tar.gz"), "w:gz")   
        for fname in os.listdir(directory):
            print("FNAME:"+fname.decode('utf-8'))
            if ( fname.decode('utf-8').endswith(".txt") ) :
                basedir = os.path.abspath(os.path.dirname(__file__))
                fullpath = os.path.join(basedir,'public', fname.decode('utf-8')) 
                tar.add(fullpath, arcname="explanations-wx-"+os.path.basename(fullpath))
        tar.close()
        return {"generated_text": output, "archive" : os.path.basename(tar.name)}
    else:
        response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
         #print(response.json())
        return response.json()['results'][0]['generated_text']
     
## BAM API / DEPRECATED
@app.post("/v1/explain")
async def generate_code(request_data: CodeGenerationRequest, batchmode: str = "false"):
    
    url = "https://bam-api.res.ibm.com/v2/text/generation?version=2024-09-13"
    token=request_data.api_key

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
    }
    request_data.__delattr__('api_key')
    #print("HEADERS: "+ headers.__str__)
    print(request_data.model_dump_json())

    response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
    print(response.json())
    return response.json()['results'][0]['generated_text']


@app.post("/v1/wca4z-explain")
async def generate_code2(request_data: CodeExplainWCAZ, batchmode: str = "false"):

    token=get_bearer_token(request_data.api_key)

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
                    'user-agent' : 'zCodeAssistant/2.3.0' 
                }
                #Remove API Key and Level passed in the POST data part of the initial request 
            
                response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
                json_data = response.json()
                code=json_data['generated_text'].replace('\\n', '\n')
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
    else:
        level=request_data.level
        url = "https://api.dataplatform.cloud.ibm.com/v1/wca/code/explanation/COBOL?level="+level
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}',
            'user-agent' : 'zCodeAssistant/2.3.0' 
        }
        #Remove API Key and Level passed in the POST data part of the initial request 
        request_data.__delattr__('api_key')
        request_data.__delattr__('level')
        response = requests.request("POST", url, headers=headers, data=request_data.model_dump_json())
        json_data = response.json()
        code=json_data['generated_text']
        return code


@app.post("/v1/cleanupfolder")
async def cleanup_files(request_data: FolderName):
    
    basedir = os.path.abspath(os.path.dirname(__file__))
    save_path = 'public'
    fullpath = os.path.join(basedir,save_path) 
    files = os.listdir(fullpath)
    for file in files:
       file_path = os.path.join(os.path.join(basedir,save_path), file)
       if os.path.isfile(file_path):
         print("deleting "+file_path)
         os.remove(file_path)
    
    return {"Result": "OK"}



@app.post("/v1/uploadfile")
async def upload_file(request_data: FileUpload):
    
    file_name=request_data.file_name
    source_code= base64.b64decode(request_data.source_code).decode('utf-8')
    save_path = 'public'
    basedir = os.path.abspath(os.path.dirname(__file__))
    fullpath = os.path.join(basedir,save_path, file_name)  
    import glob
    
    files = glob.glob(fullpath) 
    for f in files:
        path= os.path.join(basedir,save_path,f)
        os.remove(path)       
    file1 = open(fullpath, "w+")
    file1.write(source_code)
    file1.close()

    return {"Result": "OK"}

def get_bearer_token(ibmcapikey):
     #************************************** 
    # Get Bearer Token generation from API Key:
    #**************************************
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',     
    }
    #print(request_data.model_dump_json())
    request_data2="grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey="+ibmcapikey
    response = requests.request("POST", url, headers=headers, data=request_data2)
    json_data = response.json()
    return json_data['access_token']

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="127.0.0.1", port=8080, log_level="debug")
