import { Header, HeaderName, Theme } from '@carbon/react'

const AppHeader = () => {
    return (
        <Theme className="themeWrapper" theme={'g90'}>
            <Header aria-label="Code Translator | powered by watsonx.ai">
                <HeaderName prefix="Code Translator">| powered by watsonx.ai</HeaderName>
            </Header>
        </Theme>
    )
}

export default AppHeader