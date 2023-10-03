import Editor from 'react-simple-code-editor'
import { Dropdown } from '@carbon/react'
import { highlight, languages } from 'prismjs/components/prism-core'

import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-cobol'

import './prism-vsc-dark-plus.scss'
import './CodeEditor.scss'

const CodeEditor = ({ code, setCode, selectedLanguage, setSelectedLanguage, readOnly }: { code: string, setCode?: CallableFunction, selectedLanguage: string, setSelectedLanguage: CallableFunction, readOnly: boolean }) => {
    return (
        <>
            <Dropdown id='dropdown-code-language' items={['cobol', 'java']} label={'Select Language'} onChange={({ selectedItem }: { selectedItem: string }) => { setSelectedLanguage(selectedItem) }} />
            <Editor
                readOnly={readOnly}
                className='code-editor'
                value={code}
                onValueChange={setCode != null ? (code) => setCode(code) : () => { }}
                // Create mapping
                highlight={(code) => highlight(code, selectedLanguage === 'java' ? languages.java : languages.cobol)}
                padding={10}
                style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 14, }}
            />
        </>
    )
}

export default CodeEditor