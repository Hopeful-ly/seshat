import React from "react";
import { produce } from "immer";
import { EditorData } from "../Editor";
import { BlockModifier, ContentModifier, createModifier } from "../Modifier";
import { accessor } from "../util";
import { v4 } from "uuid";
import Path from "../Path";
import { parseInt } from "lodash";
import { createBlock } from "../Block";
import { BlockData, ContentData } from "../types";
import { createContent } from "../Content";

export class EditorBlockModifier extends BlockModifier {
  public static readonly id: string = "editable";
  public static readonly description: string =
    "Core modifier for editing support";

  public getBlockProperties(editor: EditorData, path: Path) {
    return {
      attributes: {
        onClick: (e: React.MouseEvent) => this.handleClick(editor, e, path),
      },
      contentsAttributes: {
        onClick: (e: React.MouseEvent) => this.handleClick(editor, e, path),
      },
    };
  }

  private handleClick(editor: EditorData, event: React.MouseEvent, path: Path) {
    console.log("Someone clickin!");
    if (event.target === event.currentTarget) {
      console.log("They be clickin on me, dawg!");
      const block = accessor(editor.blocks, path) as BlockData;
      console.log("The block", block);

      if (block.contents.length === 0) {
        editor.setBlocks(
          produce((draft) => {
            const block = accessor(draft, path) as BlockData;
            block.contents.push(
              createContent("", [createModifier("editable")]),
            );
          }),
        );
      } else {
        const latestContent = block.contents.at(-1);
        console.log("Latest content", latestContent);
        if (!latestContent) return;

        this.setFocus(editor, latestContent.id);
      }
    }
  }
  private setFocus(editor: EditorData, pathOrId: Path | string) {
    editor.setFocusedOn({
      id:
        typeof pathOrId === "string"
          ? pathOrId
          : accessor(editor.blocks, pathOrId).id,
      type: "block",
    });
  }
}

export class EditorContentModifier extends ContentModifier {
  public static readonly id: string = "editable";
  public static readonly description: string =
    "Core modifier for editing support";

  public getContentProperties(editor: EditorData, path: Path) {
    return {
      attributes: {
        contentEditable: true,
        suppressContentEditableWarning: true,
        onClick: () => this.setFocus(editor, path),
        onInput: (event: React.FormEvent) =>
          this.handleInput(event, editor, path),
        onKeyDown: (event: React.KeyboardEvent) =>
          this.handleKeyDown(event, editor, path),
      },
    };
  }

  private handleInput(event: React.FormEvent, editor: EditorData, path: Path) {
    const target = event.target as HTMLDivElement;
    const text = target.innerText;

    this.handleText(editor, path, text);

    this.setFocus(editor, path);
  }

  private handleText(editor: EditorData, path: Path, text: string) {
    editor.setBlocks(
      produce((draft) => {
        const block = accessor(draft, path);
        block.content = text;
      }),
    );
  }

  private setFocus(editor: EditorData, pathOrId: Path | string) {
    editor.setFocusedOn({
      id:
        typeof pathOrId === "string"
          ? pathOrId
          : accessor(editor.blocks, pathOrId).id,
      type: "content",
    });
  }

  private handleKeyDown(
    event: React.KeyboardEvent,
    editor: EditorData,
    path: Path,
  ) {
    console.log("YOO Someone keyed", path, event);
    if (event.key === "Enter" && !event.shiftKey) {
      this.handleEnter(editor, event, path);
      // } else if (event.code === "Space") {
      //   this.handleSpace(editor, event, path);
      // } else if (event.key === "Enter" && event.shiftKey) {
      //   this.handleShiftEnter(editor, event, path);
    } else if (event.key === "Backspace") {
      this.handleBackspace(editor, event, path);
    }
  }
  private handleShiftEnter(
    editor: EditorData,
    event: React.KeyboardEvent,
    path: Path,
  ) {
    event.preventDefault();

    editor.setBlocks(
      produce((draft) => {
        const content = accessor(draft, path) as ContentData;
        content.content += "\n";
      }),
    );
  }
  private handleSpace(
    editor: EditorData,
    event: React.KeyboardEvent,
    path: Path,
  ) {
    event.preventDefault();

    editor.setBlocks(
      produce((draft) => {
        const content = accessor(draft, path) as ContentData;
        content.content += " ";
      }),
    );
  }
  private handleEnter(
    editor: EditorData,
    event: React.KeyboardEvent,
    path: Path,
  ) {
    event.preventDefault();

    const block = createBlock(
      [createContent("", [createModifier("editable")])],
      [createModifier("editable")],
    );

    const newContentId = block.contents[0].id;

    const currentIndex = parseInt(path.back().back().leaf());
    const blockListPath = path.back().back().back();
    const newPath = blockListPath.at(currentIndex + 1);

    console.log("COOOOOOOOOOL", {
      currentIndex,
      blockListPath: blockListPath.toString(),
      newPath: newPath.toString(),
    });

    editor.setBlocks(
      produce((draft) => {
        const blockList = accessor(draft, blockListPath);
        blockList.splice(currentIndex + 1, 0, block);
      }),
    );

    this.setFocus(editor, newContentId);
  }

  private handleBackspace(
    editor: EditorData,
    event: React.KeyboardEvent,
    path: Path,
  ) {
    const content = accessor(editor.blocks, path);

    if (content.content.length !== 0) {
      return;
    }

    event.preventDefault();
    const contentList = accessor(editor.blocks, path.back());
    if (contentList.length !== 1) {
      // delete current content and focus on previous content

      const currentContentIndex = parseInt(path.leaf());

      editor.setBlocks(
        produce((draft) => {
          const blockList = accessor(draft, path.back());
          blockList.splice(currentContentIndex, 1);
        }),
      );

      this.setFocus(editor, path.back().at(currentContentIndex - 1));

      return;
    }

    const blockList = accessor(editor.blocks, path.back().back());
    const currentBlockIndex = parseInt(path.back().back().leaf());
    if (blockList.length !== 1 && currentBlockIndex > 0) {
      // delete current content and focus on previous block

      const blockListPath = path.back().back().back();

      editor.setBlocks(
        produce((draft) => {
          const blockList = accessor(draft, blockListPath);
          blockList.splice(currentBlockIndex, 1);
        }),
      );

      this.setFocus(
        editor,
        blockListPath
          .at(currentBlockIndex - 1)
          .contents()
          .at(
            accessor(
              editor.blocks,
              blockListPath.at(currentBlockIndex - 1).contents(),
            ).length - 1,
          ),
      );

      return;
    }
  }
}
