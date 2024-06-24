import { createContext } from "react";
import { BlockProperties, ContentProperties, ModifierData } from "./types";
import { EditorData } from "./Editor";
import Path from "./Path";

class Modifier {
  constructor(public readonly data: any) {}
}

export const createModifier = (id: string, data: any = {}) => {
  return { data, id } satisfies ModifierData;
};

export abstract class BlockModifier extends Modifier {
  public abstract getBlockProperties(
    editor: EditorData,
    path: Path,
  ): Partial<BlockProperties>;
}

export abstract class ContentModifier extends Modifier {
  public abstract getContentProperties(
    editor: EditorData,
    path: Path,
  ): Partial<ContentProperties>;
}

export const getModifiers = (
  modifiers: ModifierData[],
  availableModifiers: Record<
    string,
    typeof BlockModifier | typeof ContentModifier
  >,
) => {
  return modifiers.map((modifierData) => {
    const ModifierClass = availableModifiers[modifierData.id];
    //@ts-ignore
    const modifier = new ModifierClass(modifierData.data);
    return modifier;
  });
};
