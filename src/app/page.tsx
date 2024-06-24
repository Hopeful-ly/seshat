"use client";
import Editor, { useEditor } from "@/editor/Editor";

export default function Home() {
  const editor = useEditor();

  return (
    <div className="w-screen h-screen m-0 flex flex-row justify-center items-center">
      <div className="w-1/2">
        <Editor {...editor} />
      </div>
      <textarea
        className="w-1/2 h-full border-2 rounded p-3"
        value={JSON.stringify(editor.blocks, null, 5)}
        onChange={(e) => {
          editor.setBlocks(JSON.parse(e.target.value));
        }}
      ></textarea>
    </div>
  );
}
