import React from "react";

export type BlockData = {
  id: string;

  modifiers: ModifierData[];
  contents: ContentData[];

  children: BlockData[];
};

export type BlockProperties = {
  element: React.ReactNode;
  attributes: Record<string, any>;
  contentsElement: React.ReactNode;
  contentsAttributes: Record<string, any>;
  contentDisabled: boolean;
};

export type ContentData = {
  id: string;
  content: string;
  modifiers: ModifierData[];
};

export type ContentProperties = {
  element: React.ReactNode;
  attributes: Record<string, any>;
};

export type ModifierData = {
  id: string;
  data: Record<string, any>;
};
