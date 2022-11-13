import { setRelaunchButton } from "@create-figma-plugin/utilities";
import { traverseNode } from "@create-figma-plugin/utilities";
import { TText } from "./tText";
import i18next from "i18next";

async function loadFont(text: TextNode) {
  const font = <FontName>text.fontName;
  await figma.loadFontAsync({ family: font.family, style: font.style });
}

function findIntepolationText(lang: string = "en"): string {
  const text = figma.currentPage.findAll((n) => n.name === `##key.${lang}`);
  const textNode = <TextNode>text[0];
  return `{ ${textNode.characters} }`;
}

async function updateValue(textNode: TextNode, translate: string) {
  const updateValue = i18next.t(translate);

  if (textNode.characters !== updateValue) {
    await loadFont(textNode).then(() => {
      textNode.characters = updateValue;
    });
  }
}

function findAllText(): Array<TText> {
  let tTexts: TText[] = [];

  const resultNodes: Array<SceneNode> = figma.currentPage.findAll(
    (node) => node.type === "TEXT" && /#t.|_#t./.test(node.name)
  );

  resultNodes.forEach((node) => {
    if (node.type == "TEXT") {
      tTexts.push(new TText(node));
    }
  });
  return tTexts;
}

async function updateAllTextProperty() {
  const textJsonEn = findIntepolationText("en");
  const textJsonTh = findIntepolationText("th");

  const jsonObjectEn = JSON.parse(textJsonEn);
  const jsonObjectTh = JSON.parse(textJsonTh);

  i18next.init({
    compatibilityJSON: "v3",
    fallbackLng: ["en", "th"],
    debug: true,
    resources: {
      th: {
        translation: jsonObjectTh,
      },
      en: {
        translation: jsonObjectEn,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  i18next.changeLanguage("th", (err, t) => {
    if (err) console.log("Error:", err);
  });

  const tTexts: TText[] = findAllText();

  // const textNodes = figma.currentPage.findAll(
  //   (node) => /#t.|_#t./.test(node.name) && node.type == "TEXT"
  // );

  await Promise.all(
    tTexts.map((tText) => {
      const name = tText.key;
      return updateValue(tText.node, name);
    })
  );
}

export default function () {
  setRelaunchButton(figma.currentPage, "figma-i18next", {
    description: "🔍 Update text",
  });

  updateAllTextProperty().then(() => {
    figma.closePlugin("Updated 🎉");
  });
}

export { updateAllTextProperty };
