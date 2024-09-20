"use client";

import { SetStateAction, useState, useEffect, FormEventHandler } from 'react';
import { Switcher, Notification, UserAvatar } from "@carbon/icons-react";
import { Buffer } from "buffer";

import CodeEditor from './CodeEditor';
import { Grid, Column, 
  Button, InlineLoading, 
  PasswordInput,FileUploader ,
  FileUploaderDropContainer,
  Header,
  HeaderContainer,Link,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  TextArea,
  Tile,
  RadioButton,
  RadioButtonGroup, 
  SkipToContent,
  Dropdown,
  SideNav,
  SideNavItems,
  HeaderSideNavItems, Toggle,
  Filename
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
  const [multifile, setMultifile] = useState(false);
  const [multifileResult, setMultifileResult] = useState('');
  const [multifileArchive, setMultifileArchive] = useState('');

  const [pgmList, setPgmList] = useState('');

  const [model, setModel] = useState('mistralai/mixtral-8x7b-instruct-v01');
  const [modelsist,setModelList] = useState('');
  const [detailLevel, setDetailLevel] = useState('SIMPLE');
  const [resultMessage,setResultMessage] = useState('');

  



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

    const response = await fetch('http://127.0.0.1:8080/v1/wca4z-explain?batchmode='+multifile, {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    });
    const result = await response.text();
    console.log('RESULT:', result);
    interface MyObj {
      generated_text: string;
      archive: string;
     }
     let obj: MyObj = JSON.parse(result);
    console.log(obj.generated_text);
    console.log(obj.archive);
    setFetching(false);
    setResultMessage("Explanation Ready in file "+obj.archive+" ")
    setMultifileResult(obj.generated_text)
    setMultifileArchive(obj.archive)
    return result;
  };
  

  return (
    <>
      <AppHeader />
      <div id="main">
        
        <h1>Code Explainer </h1>
        <h2> watsonx.ai / Code Assistant for Z</h2>
        <Grid>
        <Column lg={6} md={8} sm={4}>
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
        </Column>
            <Column lg={6} md={8} sm={4}>
        <Toggle labelText="Batch Mode" labelA="Off" labelB="On" toggled={multifile}  id="toggle-2"
        onToggle={(e) => {
          console.log(e);
          setMultifile(e)
          setResultMessage("")  
          setFetching(false);
          setMultifileResult("")
        }}
        />
        </Column>
       </Grid>
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
             // labelText='Add Files to explain'
              filenameStatus="edit"
              multiple
             onChange={ async (e: React.ChangeEvent<HTMLInputElement>) => {
                console.log(e.target.files)
                var content=""
                if (e.target.files ) {
                  setMultifile(false)
                  setMultifileResult("")
                  if(e.target.files.length==1){
                  var fileReader = new FileReader();
                  fileReader.onload = () => {
                  const fileContent = fileReader.result as string;
                  setSourceCode(fileContent);
                   };
                  if (e.target.files[0].name.endsWith(".cbl"))
                  {
                    setSelectedSourceLanguage("cobol");
                    setSelectedDestinationLanguage("markdown") //deprecated, use TextArea instead.
                  }
                  content=fileReader.readAsText(e.target.files[0])+""
                  setSourceCode(content)                 
                   
                }
                else {
                  setMultifile(true)
                  if (e.target.files[0].name.endsWith(".cbl"))
                    {
                      setSelectedSourceLanguage("cobol");
                      setSelectedDestinationLanguage("markdown") //deprecated, use TextArea instead.
                    }
                  function readFileAsText(file: File): Promise<string | ArrayBuffer | null> {
                    return new Promise((resolve, reject) => {
                        const fr = new FileReader();
                
                        fr.onload = () => {
                          //  resolve(fr.result)
                        };
                       fr.onloadend= () => {
                        resolve(fr.result)
                        };
                       
                        fr.onerror = () => {
                            reject(fr);
                        };               
                         fr.readAsText(file)
                      }) ;
                    }
                 // Store promises in array
                let files=e.target.files
                let readers = [];
                 // Abort if there were no files selected
                if(!files) return;
                for(let i = 0;i < files.length;i++){ 
                  if (e.target.files[i].name.endsWith(".cbl"))  
                    readers.push(readFileAsText(files[i]));
              }    
                  // Trigger Promises
                Promise.all(readers).then((values) => {
                  // Values will be an array that contains an item
                  // with the text of every selected file
                  // ["File1 Content", "File2 Content" ... "FileN Content"]
                  for(let i = 0;i < files.length;i++){    
                    //files[i] , values[i]
                    
                    const uploadFile = async (filename:string, sourceCode: string) => {
    
                      setFetching(true);
                      
                      let myHeaders = new Headers();
                      myHeaders.append('Accept', 'application/json');
                      myHeaders.append('Content-Type', 'application/json');
                      
                      let base64code= btoa(sourceCode)
                      
                      const raw = JSON.stringify({
                  
                         source_code: base64code, file_name:filename
                  
                      });
                  
                      const response = await fetch('http://127.0.0.1:8080/v1/uploadfile', {
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
                    if (e.target.files && e.target.files[i].name.endsWith(".cbl"))  
                       {
                      uploadFile(files[i].name,values[i]+"")
                      setResultMessage("Files loaded, ready for explanation\n")
                      setSourceCode("dummy")
                    }
                }    
                  
              });
              
                }
              }  
              }  
            }
              onDelete={(e) => {
                //console.log(e);
                //console.log(e.target);
                setSourceCode("")
              }}
              
           
            />
   
   {multifile &&(
            <Column lg={8} md={8} sm={4}>
                <Tile className="upload-status" 
                >{resultMessage}
                 {multifileResult &&(<a href={ 'http://localhost:8080/static/' + multifileArchive }>{multifileArchive}</a>)}
                </Tile>
                                        
           </Column>
                )}


        
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
         
      
          {!multifile &&(
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
          )}
        
          <Column lg={16} md={8} sm={4}>
          {!multifile &&(
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
              )}

           {multifileResult &&(   
                <ExplanationViewer
                code={multifileResult}
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
            )}

          </Column>
      
    
      
        </Grid>
       
      </div>
    
    </>
  );
}

export default App;
