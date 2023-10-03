import connexion
import six
from flask_cors import cross_origin
import requests
import json
from flask import Response

from swagger_server.__main__ import app
from swagger_server.models.inline_response200 import InlineResponse200  # noqa: E501
from swagger_server.models.v1_generate_body import V1GenerateBody  # noqa: E501
from swagger_server import util


@app.app.before_request
def before_request():
    headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type'}
    return Response()


@cross_origin()
def v1_generate_post(body):  # noqa: E501
    """Generate text using a language model

     # noqa: E501

    :param body: JSON request body
    :type body: dict | bytes

    :rtype: InlineResponse200
    """
    print('body', body)
    if connexion.request.is_json:
        body = V1GenerateBody.from_dict(connexion.request.get_json())  # noqa: E501
    
    url = "https://bam-api.res.ibm.com/v1/generate"
    
    # {"model_id": "salesforce/codegen2-16b",
    #  "inputs": [
    #      "Translate this Cobol code into Java.\nCobol:\n*> setup the identification division\nIDENTIFICATION DIVISION.\n*> setup the program id\nPROGRAM-ID. HELLO.\n*> setup the procedure division (like 'main' function)\nPROCEDURE DIVISION.\n*> print a string\nDISPLAY 'WILLKOMMEN'.\n*> end our program\nSTOP RUN.\nJava:"
    #  ],
    #  "parameters": {
    #      "decoding_method": "greedy",
    #      "repetition_penalty": 1,
    #      "min_new_tokens": 2,
    #      "max_new_tokens": 300,
    #      "moderations": {
    #          "hap": {
    #              "input": false,
    #              "threshold": 0.75,
    #              "output": false
    #          }
    #      }
    #  }
    #  }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer pak-LqER53LspelBxJbRsvIX2XmqLumCHkG8AW83QZo-8Ys',
    }
    
    response = requests.request("POST", url, headers=headers, data=json.dumps(body.to_dict()))
    
    generated_text = response.json()['results'][0]['generated_text']
    return generated_text
