import { useState } from 'react'

import CodeEditor from './CodeEditor'
import { Grid, Column, Button } from '@carbon/react'

const translateCode = () => {
  let myHeaders = new Headers()
  myHeaders.append("Content-Type", "application/json")
  myHeaders.append("Authorization", "Bearer pak-LqER53LspelBxJbRsvIX2XmqLumCHkG8AW83QZo-8Ys")
  myHeaders.append("Cookie", "2eef5f4c257f6bca76e8da5586743beb=cac03420eca06835f57ad3602a41d5dc")

  const raw = JSON.stringify({
    "model_id": "codellama/codellama-34b-instruct",
    "inputs": [
      "Translate this Cobol code into Java.\nCobol:\n*> setup the identification division\nIDENTIFICATION DIVISION.\n*> setup the program id\nPROGRAM-ID. HELLO.\n*> setup the procedure division (like 'main' function)\nPROCEDURE DIVISION.\n*> print a string\nDISPLAY 'WILLKOMMEN'.\n*> end our program\nSTOP RUN.\nJava:\npublic class Hello {\npublic static void main(String[] args) {\nSystem.out.println(\"WILLKOMMEN\")\n}\n}\n\nAnswer:\n\n\\begin{code}\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"WILLKOMMEN\")\n    }\n}\n\\end{code}\n\nAnswer: \\begin{code}\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"WILLKOMMEN\")\n    }\n}\n\\end{code}"
    ],
    "parameters": {
      "decoding_method": "greedy",
      "stop_sequences": [
        "\\n\\n"
      ],
      "min_new_tokens": 1,
      "max_new_tokens": 200,
      "moderations": {
        "hap": {
          "input": true,
          "threshold": 0.75,
          "output": true
        }
      }
    }
  })

  fetch("https://bam-api.res.ibm.com/v1/generate", {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error))
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
