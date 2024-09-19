"use client";

import { SetStateAction, useState, useEffect, FormEventHandler } from 'react';
import { Switcher, Notification, UserAvatar } from "@carbon/icons-react";
import { Buffer } from "buffer";

import CodeEditor from './CodeEditor';
import { Grid, Column, 
  Button, InlineLoading, 
  PasswordInput,FileUploader ,
  Header,
  HeaderContainer,Link,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  RadioButton,
  RadioButtonGroup, 
  SkipToContent,
  Dropdown,
  SideNav,
  SideNavItems,
  HeaderSideNavItems, Toggle
} from '@carbon/react';


import './App.scss';
import AppHeader from './AppHeader';
import ExplanationViewer from './ExplanationViewer';

//FILE upload import axios from 'axios';
//import { readFile, readFileSync } from 'fs';

const codeSnippet = `
 *> setup the identification division
 IDENTIFICATION DIVISION.
 *> setup the program id
 PROGRAM-ID. HELLO.
 *> setup the procedure division (like 'main' function)
 PROCEDURE DIVISION.
 *> print a string
 DISPLAY 'WILLKOMMEN'.
 *> end our program
 STOP RUN.
 `


const stringBetweenStrings = (
  startStr: string,
  endStr: string,
  str: string
) => {
  var pos = str.indexOf(startStr) + startStr.length;
  console.log(startStr, endStr, str, pos );
  if(pos<=3) { str=startStr+str+endStr; pos = str.indexOf(startStr) + startStr.length;}   
  console.log(startStr, endStr, str, pos );
  return str.substring(pos, str.indexOf(endStr, pos));
};

function App() {
  const [sourceCode, setSourceCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('');
  const [selectedDestinationLanguage, setSelectedDestinationLanguage] =
    useState('');
  const [fetching, setFetching] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [modeWCAZ, setModeWCAZ] = useState(false);
  const [model, setModel] = useState('mistralai/mixtral-8x7b-instruct-v01');
  const [modelsist,setModelList] = useState('');
  const [detailLevel, setDetailLevel] = useState('SIMPLE');



  const [sourcePgm, setSourcePgm] = useState('');
  const [disabledControl, setDisabledControl] = useState(true);
  // prism
  const supportedLanguages = ['cobol', 'java', 'javascript', 'python','markdown'];
  
  const models = ['mistralai/mixtral-8x7b-instruct-v01', 'ibm/granite-34b-code-instruct','ibm/granite-20b-code-javaenterprise'];
  const modelswcaz = ['ibm/granite-20b-code-instruct-v2'];

  var fileURL="";
  
  const wrapperString = '```';

  useEffect(() => {
    console.log('sourceCode', sourceCode);
  }, [sourceCode]);

  useEffect(() => {
    console.log('destinationCode', destinationCode);
  }, [destinationCode]);


  const explain = async () => {
    if(modeWCAZ)
      return explainCodeWCAZ()
    else
      return explainCode()
  }

  const explainCode = async () => {
    
    setFetching(true);
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    // const input =
    //   '[INST] Please translate following ' +
    //   selectedSourceLanguage +
    //   ' code into ' +
    //   selectedDestinationLanguage +
    //   '. Please wrap your code answer using' +
    //   wrapperString +
    //   ':\n' +
    //   sourceCode +
    //   '\n[/INST]';
   
   // const input = 'Please translate following ' + selectedSourceLanguage + ' code into ' + selectedDestinationLanguage + '. Only return the translated code and wrap it in ' + wrapperString + '.\n' + selectedSourceLanguage + ':\n' + sourceCode + '\n' + selectedDestinationLanguage + ':\n'
   const input = `
    You are an expert COBOL Developer who can effectively understand and document the existing COBOL code,
   ensuring a smooth transition to modern systems while preserving essential business logic and functionality. 
    Your task is to summarize the given COBOL code. A well-formatted summary document should have the following six sections:
    1. Program Analysis: Make sure this section should explain why the program is called.
    2. Set of operations performed: Make sure this section should summarize the functionality of the program.
    3. Files Used:Make sure this section lists and explain files used in the program also highlighting whether they are used as input, output or both (I-O)
    4. Program Called:Make sure this section should only list all external programs called like CALL " " , and subroutines or sub-programs are not included.
    5. Program Includes:Make sure this section should only list all the COBOL includes used in the program.
    5. Input to the program: Make sure this section should list all Input parameters to the program,all variables declared under "LINKAGE SECTION" should be captured here.
    6. Program Detail Analysis (Section wise) : Make sure this part has a list of all sections of the program, in order of execution and you explain the code in each section line by line with all the variables used, the main logic, and the code flow.

    COBOL Code:
    {{PROMPT}}
    Program Analysis:
    `
    
    const raw = JSON.stringify({
      api_key: apiKey,
      // model_id: 'codellama/codellama-34b-instruct',
      model_id: model,
      input: input,
      parameters: {
        decoding_method: 'greedy',
        min_new_tokens: 1,
        max_new_tokens: 500//,
        //stop_sequences: ["\n\n"]
      },
      data:{ PROMPT: sourceCode}

    });

    const response = await fetch('http://127.0.0.1:8080/v1/explain', {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    });
    const result = await response.text();
    console.log('result', result);
    setFetching(false);
    return result;
  };

  const explainCodeWCAZ = async () => {
    
    setFetching(true);
    
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('User-Agent', 'zCodeAssistant/2.1.0');
    
    let base64code= btoa(sourceCode)

    const raw = JSON.stringify({

       source_code: base64code, api_key: apiKey2 , level : detailLevel

    });

    const response = await fetch('http://127.0.0.1:8080/v1/wca4z-explain', {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    });
    const result = await response.text();
    console.log('result', result);
    setFetching(false);
    return result;
  };
  
  return (
    <>
      <AppHeader />
      <div id="main">
        <h1>Code Explainer </h1>
        <h2> watsonx.ai / Code Assistant for Z</h2>
        <Toggle labelText="Code Assistant for Z" labelA="Off" labelB="On"  id="toggle-1"
        onToggle={(e) => {
          console.log(e);
          setModeWCAZ(e)  
          if (!modeWCAZ) 
            setModel(modelswcaz[0])
          else
            setModel(models[0])  
                
        }}
        />
        <Grid>
          <Column lg={6} md={8} sm={4}>
            <PasswordInput
              id="password"
              labelText="watsonx.ai API Key (BAM)"
              disabled={modeWCAZ}
              onChange={(e: { target: { value: SetStateAction<string> } }) => {
                setApiKey(e.target.value);
              }}
            />
            </Column>
            <Column lg={6} md={10} sm={4}>
           <Dropdown 
              id="dropdown-code-model"    
              initialSelectedItem={model}   
             items={modeWCAZ?modelswcaz:models}
             titleText="Model"
             disabled={modeWCAZ}
             label={'Select Model'}
             type="default"
             onChange={({ selectedItem }: { selectedItem: string }) => {
              setModel(selectedItem);
            }}
            
             /> 
          </Column> 
            <Column lg={6} md={8} sm={4}>
            <PasswordInput
              id="password-wca4z"
              disabled={!modeWCAZ}
              labelText="watsonx Code Assistant for Z API Key"
              onChange={(e: { target: { value: SetStateAction<string> } }) => {
                setApiKey2(e.target.value);
              }}
            />
            </Column>
            <Column lg={6} md={8} sm={4}>
            <RadioButtonGroup legendText="watsonx Code Assistant for Z Explanation Level" 
            name="radio-button-default-group " 
            disabled={!modeWCAZ}
            onChange={ 
              (e: React.ChangeEvent<HTMLInputElement>) => { setDetailLevel(e+"");
            }}
            >
               <RadioButton labelText="Simple" value="SIMPLE" id="radio-1" checked />
               <RadioButton labelText="Detailed" value="DETAILED" id="radio-2" />
               <RadioButton labelText="Guided" value="GUIDED" id="radio-3" />
              
            </RadioButtonGroup>
            </Column>
          
            <Column lg={14} md={8} sm={4}>
              <FileUploader
              id="text-input-addi-btn"
              buttonLabel="Choose File"
              labelDescription="File to explain"
              filenameStatus="edit"
             onChange={ 
              (e: React.ChangeEvent<HTMLInputElement>) => {
                console.log(e.target.files)
                var content=""
                if (e.target.files ) {
                  var fileReader = new FileReader();
                  fileReader.onload = () => {
                  const fileContent = fileReader.result as string;
                  setSourceCode(fileContent);
                   };
                  if (e.target.files[0].name.endsWith(".cbl"))
                  {
                    setSelectedSourceLanguage("cobol");
                    setSelectedDestinationLanguage("markdown")
                  }
                  content=fileReader.readAsText(e.target.files[0])+""
                  setSourceCode(content)                 
              
                }  
              }  
            }
              onDelete={(e) => {
                //console.log(e);
                //console.log(e.target);
                setSourceCode("")
              }}
              
           
            />
         
         <Button
          id="button-explain"
          onClick={async () => {
            setDestinationCode(
              stringBetweenStrings(
                wrapperString,
                wrapperString,
                await explain()
              ).replace(/\\n/g, '\r\n')
            );
          }}
          disabled={
            sourceCode === '' ||
            selectedSourceLanguage === '' ||
            selectedDestinationLanguage === '' ||
            fetching ||
            apiKey ==='' && !modeWCAZ ||
            apiKey2 === '' && modeWCAZ
          }
        >
          {fetching ? (
            <InlineLoading
              status="active"
              iconDescription="Loading"
              description="Explaining ..."
            />
          ) : (
            'Explain'
          )}
        </Button>
         </Column>
         
          
          <Column lg={8} md={8} sm={4}>
            <CodeEditor
              
              code={sourceCode}
              setCode={setSourceCode}
              supportedLanguages={supportedLanguages}
              selectedLanguage={selectedSourceLanguage}
              setSelectedLanguage={setSelectedSourceLanguage}
              readOnly={false}
              key="source-editor"
              disabledControl={false}
              setDisabledControl={false}   
              heading="Cobol code" 
            />
          </Column>
          <Column lg={8} md={8} sm={4}>
            <ExplanationViewer
              code={destinationCode}
              setCode={setDestinationCode}
              supportedLanguages={supportedLanguages}
              selectedLanguage={selectedDestinationLanguage}
              setSelectedLanguage={setSelectedDestinationLanguage}
              readOnly={true}
              key="destination-editor"
              disabledControl={false} 
              setDisabledControl={false}  
              heading={"Explanation ("+model+")"}      
                />
          </Column>
      
    
      
        </Grid>
       
      </div>
    
    </>
  );
}

export default App;
