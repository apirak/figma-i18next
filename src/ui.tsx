import { h, JSX } from "preact";
import { useState } from "preact/hooks";
import { Layers } from "./page/layers";
import { Setting } from "./page/setting";
import { Library } from "./page/Library";
import { Components } from "./page/components";
import { render, Tabs, TabsOption } from "@create-figma-plugin/ui";
import { LanguageDetail } from "./page/libraryDetail";
import { Languages, Language } from "./utility/languageStorage";

function Plugin() {
  // Count render time
  // const renderCount = useRef(0);
  // useEffect(() => {
  //   renderCount.current = renderCount.current + 1;
  // });
  // console.log("Render count: ", renderCount.current);

  const [currentTab, setCurrentTab] = useState("Library");
  const [languagePage, setLanguagePage] = useState("");
  const [languageArray, setLanguageArray] = useState<Languages>([]);

  const handleLanguageSelect = (language: string): void => {
    setLanguagePage(language);
  };

  const language = (name: string): Language | undefined => {
    return languageArray.find((language) => language.language === name);
  };

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;
    setCurrentTab(newValue);
  }

  onmessage = (event) => {
    if (event.data.pluginMessage.type === 'UPDATE_LANGUAGES') {
      setLanguageArray(event.data.pluginMessage.payload);
    }
  };

  const options: Array<TabsOption> = [
    {
      children: <Layers />,
      value: "Layers",
    },
    {
      children: <Components />,
      value: "Component",
    },
    {
      children: (
        <Library
          languageArray={languageArray}
          onDetailClick={handleLanguageSelect}
        />
      ),
      value: "Library",
    },
    {
      children: <Setting />,
      value: "Setting",
    },
  ];

  if (languagePage !== "") {
    const currentLanguage = language(languagePage);

    if (currentLanguage !== undefined) {
      return (
        <LanguageDetail
          language={currentLanguage}
          onDetailClick={handleLanguageSelect}
        />
      );
    }
  }

  return <Tabs onChange={handleChange} options={options} value={currentTab} />;
}

export default render(Plugin);
