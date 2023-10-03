import { useState } from 'react'

import CodeEditor from './CodeEditor'
import { Grid, Column, Button, InlineLoading } from '@carbon/react'

import './App.scss'
import AppHeader from './AppHeader'


// const codeSnippet = `
// *> setup the identification division
// IDENTIFICATION DIVISION.
// *> setup the program id
// PROGRAM-ID. HELLO.
// *> setup the procedure division (like 'main' function)
// PROCEDURE DIVISION.
// *> print a string
// DISPLAY 'WILLKOMMEN'.
// *> end our program
// STOP RUN.
// `

function App() {
  const [sourceCode, setSourceCode] = useState('')
  const [destinationCode, setDestinationCode] = useState('')
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('')
  const [selectedDestinationLanguage, setSelectedDestinationLanguage] = useState('')
  const [fetching, setFetching] = useState(false)

  const translateCode = async (code: string) => {
    setFetching(true)

    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    const raw = JSON.stringify({
      "model_id": "salesforce/codegen2-16b",
      "inputs": [
        `Translate this Cobol code into Java.\nCobol:\n${code}\nJava:`
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
    })

    const response = await fetch("http://127.0.0.1:8080/v1/generate", {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    })
    const result = await response.text()
    setFetching(false)
    return result
  }

  return (
    <>
      <AppHeader />
      <Grid id='main'>
        <Column lg={8} md={4} sm={4}>
          <CodeEditor code={sourceCode} setCode={setSourceCode} selectedLanguage={selectedSourceLanguage} setSelectedLanguage={setSelectedSourceLanguage} readOnly={false} key='source-editor' />
        </Column>
        <Column lg={8} md={4} sm={4}>
          <CodeEditor code={destinationCode} setCode={setDestinationCode} selectedLanguage={selectedDestinationLanguage} setSelectedLanguage={setSelectedDestinationLanguage} readOnly={true} key='destination-editor' />
        </Column>
      </Grid>
      <Button onClick={async () => { setDestinationCode(await translateCode(sourceCode)) }} disabled={sourceCode === '' || selectedSourceLanguage === '' || selectedDestinationLanguage === '' || fetching}>
        {fetching ? <InlineLoading status="active" iconDescription="Loading" description="Translating ..." /> : "Translate"}
      </Button>
    </>
  )
}

export default App
