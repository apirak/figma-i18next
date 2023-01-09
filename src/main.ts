import { once, on, showUI } from "@create-figma-plugin/utilities";
import { CloseHandler } from "./types";
import {
  getLanguageArray,
  initLanguageStorage,
  deleteLanguageResource,
  replaceLanguageResource,
} from "./utility/languageStorage";
import { Language, setLanguageResource } from "./utility/languageStorage";
import { i18nInit } from "./utility/i18nUtility";
import { updateAllTextProperty } from "./updateText";

const initUIPlugin = async () => {
  await initLanguageStorage();
  await i18nInit();
  updateLanguageToUI();
};

// Post message to UI
const updateLanguageToUI = () => {
  console.log("[Begin] Update Language Send to UI");
  figma.ui.postMessage({ type: 'UPDATE_LANGUAGES', payload: getLanguageArray()})
  console.log("[End] Update Language Send to UI");
};

export default function () {
  initUIPlugin();

  once<CloseHandler>("CLOSE", function () {
    figma.closePlugin();
  });

  on("SAVE_LANGUAGE", (currentLanguageName: string, language: Language) => {
    console.log("SAVE Language", language);
    if (language.language === currentLanguageName) {
      setLanguageResource(language);
    } else {
      replaceLanguageResource(currentLanguageName, language);
    }
    updateLanguageToUI();
    updateAllTextProperty();
  });

  on("DELETE_LANGUAGE", (languageName: string) => {
    console.log("Receive DELETE", languageName);
    deleteLanguageResource(languageName);
    updateLanguageToUI();
  });

  on("ADD_LANGUAGE", (languageName: Language) => {
    console.log("Receive Add");
  });

  showUI({
    width: 340,
    height: 500,
  });
}
