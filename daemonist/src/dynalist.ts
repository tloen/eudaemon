export namespace Dynalist {
  export type FileType = "document" | "folder";

  export interface File {
    id: string;
    title: string;
    type: FileType;
    permission: number;
  }

  export interface Folder extends File {
    collapsed: boolean;
    children: string[];
  }

  export enum Color {
    None = 0,
    Red,
    Orange,
    Yellow,
    Green,
    Blue,
    Violet
  }

  export enum HeadingLevel {
    P = 0,
    H1,
    H2,
    H3
  }

  export interface Node {
    id: string;
    content: string;
    note: string;
    created: number;
    modified: number;
    children: string[];

    checked?: boolean;
    checkbox?: boolean;
    color?: Color;
    heading?: HeadingLevel;
    collapsed?: boolean;
  }

  export interface Document {
    id: string;
    title: string;
    nodes: Node[];
  }
}
