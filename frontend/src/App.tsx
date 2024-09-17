"use client";

import { SetStateAction, useState, useEffect, FormEventHandler } from 'react';
import { Switcher, Notification, UserAvatar } from "@carbon/icons-react";

import CodeEditor from './CodeEditor';
import { Grid, Column, 
  Button, InlineLoading, 
  PasswordInput,FileUploader ,
  Breadcrumb, BreadcrumbItem, 
  Dropdown, TextInput,
  Header,Link,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
} from '@carbon/react';

import './App.scss';
import AppHeader from './AppHeader';

//FILE upload import axios from 'axios';
import { readFile, readFileSync } from 'fs';

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
  const [sourcePgm, setSourcePgm] = useState('');
  const [disabledControl, setDisabledControl] = useState(true);
  // prism
  const supportedLanguages = ['cobol', 'java', 'javascript', 'python','markdown'];
  
  const sourcePgms = ['INSTCUST.CBL', 'TEST.CBL'];

  var fileURL="";
  
  const wrapperString = '```';

  useEffect(() => {
    console.log('sourceCode', sourceCode);
  }, [sourceCode]);

  useEffect(() => {
    console.log('destinationCode', destinationCode);
  }, [destinationCode]);

  const translateCode = async () => {
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
      model_id: 'mistralai/mixtral-8x7b-instruct-v01',
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

  return (
    <>
      <AppHeader />

      <HeaderContainer
    render={() => (
      <Header aria-label="Carbon Tutorial">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Open menu"
        
        />
        <Link href="/" passHref legacyBehavior>
          <HeaderName prefix="IBM">Code Explainer</HeaderName>
        </Link>
        <HeaderNavigation aria-label="Carbon Tutorial">
          <Link href="/wxmode" passHref legacyBehavior>
            <HeaderMenuItem>watsonx Code Assistant for Z Mode</HeaderMenuItem>
          </Link>
        </HeaderNavigation>
        <SideNav
          aria-label="Side navigation"
          isPersistent={false}
        >
          <SideNavItems>
            <HeaderSideNavItems>
              <Link href="/repos" passHref legacyBehavior>
                <HeaderMenuItem>watsonx Code Assistant for Z Mode</HeaderMenuItem>
              </Link>
            </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Notifications"
            tooltipAlignment="center"
            className="action-icons"
          >
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label="User Avatar"
            tooltipAlignment="center"
            className="action-icons"
          >
            <UserAvatar size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="App Switcher" tooltipAlignment="end">
            <Switcher size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
    )}
  />

      <div id="main">
        <h1>Code Explainer</h1>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <PasswordInput
              id="password"
              labelText="watsonx.ai API Key"
              onChange={(e: { target: { value: SetStateAction<string> } }) => {
                setApiKey(e.target.value);
              }}
            />
            </Column>
            <Column lg={16} md={8} sm={4}>
            {/* <TextInput
              id="text-input-addi"
              labelText="ADDI Server"
              onChange={(e: { target: { value: SetStateAction<string> } }) => {
                setApiKey(e.target.value);
              }}
            /> */}
              <FileUploader
              id="text-input-addi-btn"
              buttonLabel="Choose File"
              labelDescription="File to explain"
              filenameStatus="edit"
              
              
              ///FILE UPLOAD on SERVER?
             //onChange={ async(e: { target: { value: SetStateAction<string> } })  => {
              //   const formData = new FormData();
              //   formData.append('file', sourcePgm);
              //   const response = await axios.post('https://localhost:8080/upload', formData, {
              //     headers: {
              //         'Content-Type': 'multipart/form-data',
              //     },
              // });
              // console.log('File uploaded successfully', response.data);

             //onChange={ (e: { target: { value: SetStateAction<string> } })  => {
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
            </Column>
            <Column lg={16} md={8} sm={4}>
           {/*  <Dropdown
              id="dropdown-code-pgm"       
             items={sourcePgms}
             label={'Select Program'}
             onChange={({ selectedItem }: { selectedItem: string }) => {
              setSourcePgm(selectedItem);
            }}
             /> */}

             
            {/*  <PasswordInput
              id="text-input-program"
              labelText="Cobol program"
              onChange={(e: { target: { value: SetStateAction<string> } }) => {
                setApiKey(e.target.value);
              }}
            /> */}
          </Column>
          <Column lg={8} md={4} sm={4}>
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
              heading="Source Code" 
            />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <CodeEditor
              code={destinationCode}
              setCode={setDestinationCode}
              supportedLanguages={supportedLanguages}
              selectedLanguage={selectedDestinationLanguage}
              setSelectedLanguage={setSelectedDestinationLanguage}
              readOnly={true}
              key="destination-editor"
              disabledControl={false} 
              setDisabledControl={false}  
              heading="Explanation"        
                />
          </Column>
        </Grid>
        <Button
          id="button-translate"
          onClick={async () => {
            setDestinationCode(
              stringBetweenStrings(
                wrapperString,
                wrapperString,
                await translateCode()
              ).replace(/\\n/g, '\r\n')
            );
          }}
          disabled={
            sourceCode === '' ||
            selectedSourceLanguage === '' ||
            selectedDestinationLanguage === '' ||
            fetching ||
            apiKey === ''
          }
        >
          {fetching ? (
            <InlineLoading
              status="active"
              iconDescription="Loading"
              description="Translating ..."
            />
          ) : (
            'Translate'
          )}
        </Button>
      </div>
    </>
  );
}

export default App;
