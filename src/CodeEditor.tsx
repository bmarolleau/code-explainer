import Editor from 'react-simple-code-editor'
import { Dropdown, InlineLoading, Grid, Column } from '@carbon/react'
import { highlight, languages } from 'prismjs/components/prism-core'

import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-cobol'

import './prism-vsc-dark-plus.scss'
import './CodeEditor.scss'



const CodeEditor = ({ code, setCode }: { code: string, setCode?: CallableFunction }) => {
    return (
        <>
            <Grid>
                <Column lg={5} md={4} sm={2}>
                    <Dropdown id='dropdown-code-language' items={['cobol', 'javascript']} label={'Language'} />
                </Column>
                <Column lg={3} md={2} sm={2}>
                    <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
                </Column>
            </Grid>
            <Editor
                className='code-editor'
                value={code}
                onValueChange={setCode != null ? (code) => setCode(code) : () => { }}
                highlight={(code) => highlight(code, languages.cobol)}
                padding={10}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                }}
            />
        </>
    )
}

export default CodeEditor