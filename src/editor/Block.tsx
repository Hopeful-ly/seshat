import React, { ReactNode, useContext } from "react";
import { createDomMotionComponent, motion } from "framer-motion";
import _ from "lodash";
import { v4 } from "uuid";

import { BlockData, BlockProperties, ContentData, ModifierData } from "./types";
import Content from "./Content";
import { BlockModifier, getModifiers } from "./Modifier";
import { customizer } from "./util";
import clsx from "clsx";
import { EditorContext, EditorData } from "./Editor";
import Path from "./Path";

export type BlockProps = {
  depth: number;
  path: Path;
} & BlockData;

const Block: React.FC<BlockProps> = ({
  depth,
  path,
  contents,
  modifiers: modifierData,
  children,
}) => {
  const editorData = useContext(EditorContext);
  const { blockModifiers } = editorData;

  const modifiers = getModifiers(
    modifierData,
    blockModifiers,
  ) as BlockModifier[];

  const properties = calculateBlockProperties(modifiers, editorData, path);

  const BlockElement = getBlockElement(properties.element);
  const blockAttributes = properties.attributes;
  const isContentDisabled = properties.contentDisabled;

  const ContentElement = getBlockElement(properties.contentsElement);
  const contentsAttributes = properties.contentsAttributes;
  return (
    <BlockElement
      {...blockAttributes}
      style={{
        marginLeft: `${(depth + 1) * 2}em`,
        ...blockAttributes.style,
      }}
    >
      {!isContentDisabled && (
        <ContentElement {...contentsAttributes}>
          {contents.map((content, i) => (
            <Content
              path={path.contents().at(i)}
              key={content.id}
              {...content}
            />
          ))}
        </ContentElement>
      )}

      {children.map((blockData, i) => (
        <Block
          path={path.children().at(i)}
          key={blockData.id}
          depth={depth + 1}
          {...blockData}
        />
      ))}
    </BlockElement>
  );
};

export const createBlock = (
  contents: ContentData[],
  modifiers: ModifierData[] = [],
): BlockData => ({
  id: v4(),
  contents,
  modifiers,
  children: [],
});

export const defaultProperties: BlockProperties = {
  element: "div",
  attributes: {
    style: {
      padding: "0.5em",
      border: "1px solid #ccc",
      borderRadius: "0.5em",
    },
  },

  contentsElement: "div",
  contentsAttributes: {},

  contentDisabled: false,
};

export const defaultMotifiers: ModifierData[] = [];

const getBlockElement = (element: BlockProperties["element"]) =>
  typeof element === "string"
    ? createDomMotionComponent(element as any)
    : element;

const calculateBlockProperties = (
  modifiers: BlockModifier[],
  editor: EditorData,
  path: Path,
): BlockProperties => {
  const properties = modifiers.map((modifier) =>
    modifier.getBlockProperties(editor, path),
  );

  const elementModifier = properties.find(
    (property) => property.element !== undefined,
  );

  const attributes = [...properties, defaultProperties].reduce(
    (acc, property) => _.mergeWith(property.attributes, acc, customizer),
    {} as BlockProperties["attributes"],
  );

  const contentsElementModifier = properties.find(
    (property) => property.contentsElement !== undefined,
  );

  const contentsAttributes = [...properties, defaultProperties].reduce(
    (acc, property) =>
      _.mergeWith(property.contentsAttributes, acc, customizer),
    {} as BlockProperties["contentsAttributes"],
  );

  const contentDisabledModifier = properties.find(
    (property) => property.contentDisabled !== undefined,
  );

  return {
    element: elementModifier?.element ?? defaultProperties.element,
    contentsElement:
      contentsElementModifier?.contentsElement ??
      defaultProperties.contentsElement,

    attributes,
    contentsAttributes,

    contentDisabled:
      contentDisabledModifier?.contentDisabled ??
      defaultProperties.contentDisabled,
  };
};

export default Block;
