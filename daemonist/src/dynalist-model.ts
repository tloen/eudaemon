/* Representations of Dynalist objects. */
export namespace DynalistModel {
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

  export interface AbstractNode {
    content: string;
    note: string;
    created: Date;
    modified: Date;
    children: any[];

    checked?: boolean;
    checkbox?: boolean;
    color?: Color;
    heading?: HeadingLevel;
    collapsed?: boolean;
  }
  export interface ConcreteNode extends AbstractNode {
    key: NodeKey;
    children: NodeKey[];
  }

  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

  export interface AbstractNodeTree extends AbstractNode {
    children: AbstractNodeTree[];
  }

  export interface PotentialNodeTree extends AbstractNodeTree {
    key: NodeKey;
  }

  export interface ConcreteNodeTree extends PotentialNodeTree {
    children: ConcreteNodeTree[];
  }

  export interface Document {
    id: string;
    title: string;
    nodes: ConcreteNode[];
  }
}
