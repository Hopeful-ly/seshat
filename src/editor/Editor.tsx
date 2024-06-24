"use client";

import { produce } from "immer";
import React, { createContext, useEffect, useState } from "react";
import { v4 } from "uuid";

import Block, { createBlock } from "./Block";
import Path from "./Path";
import { EditorBlockModifier, EditorContentModifier } from "./modifiers/Editor";
import { BlockData } from "./types";
import { createContent } from "./Content";
import { createModifier } from "./Modifier";

type EditorProps = {} & EditorData;

export const EditorContext = createContext<EditorData>({
  setBlocks: () => {},
  blocks: [],
  blockModifiers: {},
  contentModifiers: {},
  setBlockModifiers: () => {},
  setContentModifiers: () => {},
  focusedOn: null,
  setFocusedOn: () => {},
});

const Editor = (editorData: EditorProps) => {
  const { blocks } = editorData;

  return (
    <EditorContext.Provider value={editorData}>
      <div className="p-3 rounded bg-slate-200">
        {blocks.map((blockData, i) => (
          <Block
            path={Path.from(i)}
            key={blockData.id}
            depth={0}
            {...blockData}
          />
        ))}
      </div>
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);

  const [focusedOn, setFocusedOn] = useState<{
    type: "block" | "content";
    id: string | string[];
  } | null>(null);

  const [blockModifiers, setBlockModifiers] = useState<Record<string, any>>({
    editable: EditorBlockModifier,
  });

  const [contentModifiers, setContentModifiers] = useState<Record<string, any>>(
    {
      editable: EditorContentModifier,
    },
  );

  useEffect(() => {
    if (focusedOn) {
      const { type, id } = focusedOn;
      if (type === "content") {
        const contentHTML = document.getElementById(id as string);
        console.log("I'm about to focus on", contentHTML);
        setTimeout(() => {
          contentHTML?.focus();
          // put the cursor to the end of the contenteditable
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(contentHTML as Node);
          range.setStart(range.endContainer, range.endOffset);
          range.collapse(true);
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, 0);
      }
    }
  }, [focusedOn, blocks]);

  useEffect(() => {
    if (blocks.length === 0) console.log("we monuted!");
    setBlocks(
      produce((draft) => {
        draft.push(
          createBlock(
            [createContent("", [createModifier("editable")])],
            [createModifier("editable")],
          ),
        );
      }),
    );
    return () => {
      setBlocks([]);
    };
  }, []);

  useEffect(() => {
    console.log("Blocks changed", blocks);
  }, [blocks]);

  return {
    blocks,
    setBlocks,

    blockModifiers,
    setBlockModifiers,

    contentModifiers,
    setContentModifiers,

    focusedOn,
    setFocusedOn,
  };
};

export default Editor;

export type EditorData = ReturnType<typeof useEditor>;
