import { SetStateAction, useState, useEffect } from 'react'

import CodeEditor from './CodeEditor'
import { Grid, Column, Button, InlineLoading, TextInput } from '@carbon/react'

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

const stringBetweenStrings = (startStr: string, endStr: string, str: string) => {
  const pos = str.indexOf(startStr) + startStr.length
  return str.substring(pos, str.indexOf(endStr, pos))
}


function App() {
  const [sourceCode, setSourceCode] = useState('')
  const [destinationCode, setDestinationCode] = useState('')
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('')
  const [selectedDestinationLanguage, setSelectedDestinationLanguage] = useState('')
  const [fetching, setFetching] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const wrapperString = '```'

  useEffect(() => {
    console.log('sourceCode', sourceCode)
  }, [sourceCode])


  useEffect(() => {
    console.log('desdestinationCode', destinationCode)
  }, [destinationCode])

  const translateCode = async () => {
    setFetching(true)

    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    const input = '[INST] Please translate following ' + selectedSourceLanguage + ' code into ' + selectedDestinationLanguage + '. Please wrap your code answer using' + wrapperString + ':\n' + sourceCode + '\n[/INST]'

    const raw = JSON.stringify({
      "api_key": apiKey,
      "model_id": "codellama/codellama-34b-instruct",
      "inputs": [input],
      "parameters": {
        "decoding_method": "greedy",
        "min_new_tokens": 1,
        "max_new_tokens": 200
      }
    })

    const response = await fetch("http://127.0.0.1:8080/v1/generate", {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    })
    const result = await response.text()
    console.log('result', result)
    setFetching(false)
    return result
  }

  return (
    <>
      <AppHeader />
      <div id='main'>
        <h1>Code Translator</h1>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <TextInput.PasswordInput id="text-input-api-key" labelText="watsonx.ai API Key" onChange={(e: { target: { value: SetStateAction<string> } }) => { setApiKey(e.target.value) }} />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <CodeEditor code={sourceCode} setCode={setSourceCode} selectedLanguage={selectedSourceLanguage} setSelectedLanguage={setSelectedSourceLanguage} readOnly={false} key='source-editor' />
          </Column>
          <Column lg={8} md={4} sm={4}>
            <CodeEditor code={destinationCode} setCode={setDestinationCode} selectedLanguage={selectedDestinationLanguage} setSelectedLanguage={setSelectedDestinationLanguage} readOnly={true} key='destination-editor' />
          </Column>
        </Grid>
        <Button id='button-translate' onClick={async () => { setDestinationCode(stringBetweenStrings(wrapperString, wrapperString, await translateCode()).replace(/\\n/g, '\r\n')) }} disabled={sourceCode === '' || selectedSourceLanguage === '' || selectedDestinationLanguage === '' || fetching || apiKey === ''}>
          {fetching ? <InlineLoading status="active" iconDescription="Loading" description="Translating ..." /> : "Translate"}
        </Button>
      </div >
    </>
  )
}

export default App
