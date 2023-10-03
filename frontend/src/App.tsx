import { useState } from 'react'

import CodeEditor from './CodeEditor'
import { Grid, Column, Button } from '@carbon/react'

const translateCode = () => {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "model_id": "salesforce/codegen2-16b",
    "inputs": [
      "Translate this Cobol code into Java.\nCobol:\n*> setup the identification division\nIDENTIFICATION DIVISION.\n*> setup the program id\nPROGRAM-ID. HELLO.\n*> setup the procedure division (like 'main' function)\nPROCEDURE DIVISION.\n*> print a string\nDISPLAY 'WILLKOMMEN'.\n*> end our program\nSTOP RUN.\nJava:"
    ],
    "parameters": {
      "decoding_method": "greedy",
      "repetition_penalty": 1,
      "min_new_tokens": 2,
      "max_new_tokens": 300,
      "moderations": {
        "hap": {
          "input": false,
          "threshold": 0.75,
          "output": false
        }
      }
    }
  });


  fetch("http://127.0.0.1:8080/v1/generate", {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

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

function App() {
  const [code, setCode] = useState(codeSnippet)

  return (
    <>
      <Grid>
        <Column lg={8} md={4} sm={4}>
          <CodeEditor code={code} setCode={setCode} key='source-editor' />
        </Column>
        <Column lg={8} md={4} sm={4}>
          <CodeEditor code={code} key='destination-editor' />
        </Column>
      </Grid>
      <Button onClick={() => { translateCode() }}>Translate</Button>
    </>
  )
}

export default App
