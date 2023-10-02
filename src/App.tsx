import { useState } from 'react'
import Editor from 'react-simple-code-editor'

import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-cobol'

import './prism-vsc-dark-plus.scss'
import './editor.scss'

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

  console.log('languages', languages)

  return (
    <div className="App">
      <div className="window">
        <div className="title-bar">
          <div className="title-buttons">
            <div className="title-button"></div>
            <div className="title-button"></div>
            <div className="title-button"></div>
          </div>
        </div>
        <div className="editor_wrap">
          <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => highlight(code, languages.cobol)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
