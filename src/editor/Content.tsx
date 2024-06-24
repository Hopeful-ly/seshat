import React, { useContext } from "react";
import _ from "lodash";

import { ContentData, ContentProperties, ModifierData } from "./types";
import { createDomMotionComponent } from "framer-motion";
import { ContentModifier, getModifiers } from "./Modifier";
import { customizer } from "./util";
import { EditorContext, EditorData } from "./Editor";
import Path from "./Path";
import { v4 } from "uuid";

type ContentProps = { path: Path } & ContentData;

const Content = ({
  content,
  modifiers: modifierData,
  path,
  id,
}: ContentProps) => {
  const editorData = useContext(EditorContext);
  const { contentModifiers } = editorData;

  const modifiers = getModifiers(
    modifierData,
    contentModifiers,
  ) as ContentModifier[];

  const properties = calculateContentProperties(modifiers, editorData, path);

  const ContentElement = getContentElement(properties.element);
  const attributes = properties.attributes;

  return (
    <ContentElement id={id} {...attributes}>
      {content}
    </ContentElement>
  );
};

export const createContent = (text: string, modifiers: ModifierData[]) => {
  return { content: text, id: v4(), modifiers } satisfies ContentData;
};

export const defaultProperties: ContentProperties = {
  element: "span",
  attributes: {
    style: {
      outline: "none",
      minWidth: "3em",
      display: "inline-block",
    },
    className: "text-lg",
  },
};

const getContentElement = (element: ContentProperties["element"]) =>
  typeof element === "string"
    ? createDomMotionComponent(element as any)
    : element;

const calculateContentProperties = (
  modifiers: ContentModifier[],
  editor: EditorData,
  path: Path,
): ContentProperties => {
  const properties = modifiers.map((modifier) =>
    modifier.getContentProperties(editor, path),
  );

  const elementModifier = properties.find(
    (property) => property.element !== undefined,
  );

  const attributes = [...properties, defaultProperties].reduce(
    (acc, property) => _.mergeWith(property.attributes, acc, customizer),
    {} as ContentProperties["attributes"],
  );

  return {
    element: elementModifier?.element ?? defaultProperties.element,
    attributes,
  };
};

export default Content;
