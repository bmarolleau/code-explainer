import { Header, HeaderName, Theme,HeaderNavigation , HeaderMenuItem,HeaderGlobalBar,HeaderGlobalAction} from '@carbon/react';

const AppHeader = () => {
  return (
    <Theme className="themeWrapper" theme={'g90'}>
      <Header aria-label="Code Explainer | powered by watsonx.ai">
        <HeaderName prefix="Code Explainer">
          | powered by watsonx.ai
        </HeaderName>
        <HeaderNavigation aria-label="IBM [Platform]">
            <HeaderMenuItem href="#">Cobol</HeaderMenuItem>
            <HeaderMenuItem href="#">Java</HeaderMenuItem>
            <HeaderMenuItem href="#">RPG</HeaderMenuItem>
          </HeaderNavigation>
      </Header>
    </Theme>
  );
};

export default AppHeader;
