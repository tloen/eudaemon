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

  export interface NodeKey {
    documentId: string;
    nodeId: string;
  }
  export interface Node {
    key: NodeKey;
    content: string;
    note: string;
    created: Date;
    modified: Date;
    children: NodeKey[];

    checked?: boolean;
    checkbox?: boolean;
    color?: Color;
    heading?: HeadingLevel;
    collapsed?: boolean;
  }

  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

  export type NodeTree = Omit<Node, "children"> & { children: NodeTree[] };

  export interface Document {
    id: string;
    title: string;
    nodes: Node[];
  }
}
