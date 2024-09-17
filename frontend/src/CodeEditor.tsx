import Editor from 'react-simple-code-editor';
import { Dropdown, Heading, Section } from '@carbon/react';
import { highlight, languages } from 'prismjs';

// this loads the language grammer
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cobol';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import './prism-vsc-dark-plus.scss';
import './CodeEditor.scss';

const CodeEditor = ({
  code,
  setCode,
  supportedLanguages,
  selectedLanguage,
  setSelectedLanguage,
  readOnly,
  disabledControl,
  heading
}: {
  code: string;
  setCode: CallableFunction;
  supportedLanguages: string[];
  selectedLanguage: string;
  setSelectedLanguage: CallableFunction;
  readOnly: boolean;
  disabledControl: boolean;
  setDisabledControl: boolean;
  heading:string;
}) => {
  const grammar = languages[selectedLanguage];

  return (
    <>
     {/*  <Dropdown
        id="dropdown-code-language"
        items={supportedLanguages}
        label={'Select Language'}
        titleText=""
        readOnly={disabledControl}
        onChange={({ selectedItem }: { selectedItem: string }) => {
          setSelectedLanguage(selectedItem);
          
        }}
      /> */}
      <Section level={3}>
      <Heading >{heading}</Heading>
      </Section>
      <Editor
        readOnly={readOnly}
        className="code-editor"
        value={code}
        onValueChange={setCode != null ? (code) => setCode(code) : () => {}}
        // Create mapping https://prismjs.com/#supported-languages
        highlight={(code) =>
          selectedLanguage
            ? highlight(code, grammar, selectedLanguage)
            : undefined
        }
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
        }}
      />
    </>
  );
};

export default CodeEditor;
