import Editor from 'react-simple-code-editor';
import { Dropdown, Heading, Section, Tile, AILabel , TextArea, AILabelContent} from '@carbon/react';
import { highlight, languages } from 'prismjs';

// this loads the language grammer
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cobol';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import './prism-vsc-dark-plus.scss';
import './ExplanationViewer.scss';

const ExplanationViewer = ({
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
  <Tile id="tile1">
  <AILabel autoAlign size="mini"> </AILabel>
      <Section level={4}>
      <Heading >{heading}</Heading>
      </Section>

      <TextArea
       labelText=""
        readOnly
        className="explanation-viewer"
        value={code}
        rows={20}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
        }}
        
      />
     
     </Tile>
    </>
    
  );
};

export default ExplanationViewer;
