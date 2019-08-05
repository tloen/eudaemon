import { DynalistModel } from "../dynalist-model";
import { API } from "./api-model";

export class MutableNodeTree implements DynalistModel.AbstractNodeTree {
  children: MutableNodeTree[];
  content: string;
  note: string;
  created: Date;
  modified: Date;
  checked?: boolean;
  checkbox?: boolean;
  color?: DynalistModel.Color;
  heading?: DynalistModel.HeadingLevel;
  collapsed?: boolean;

  constructor(tree: DynalistModel.AbstractNodeTree) {
    const { children, ...inherentProperties } = tree;
    const transformedTree = {
      ...inherentProperties,
      children: children.map(tree => new MutableNodeTree(tree))
    };
    Object.assign(this, tree); // sigh
  }

  public updateProperties(props: Partial<DynalistModel.AbstractNodeTree>) {
    Object.assign(this, props);
  }

  public removeChild = (index: number) => {
    this.children.splice(index, 1);
  };

  public pushSubtree = (tree: DynalistModel.AbstractNodeTree) => {
    this.children.push(new MutableNodeTree(tree));
  };
}

export class MutableConcreteNodeTree extends MutableNodeTree
  implements DynalistModel.PotentialNodeTree {
  key: DynalistModel.NodeKey;

  constructor(tree: DynalistModel.PotentialNodeTree) {
    const { key, ...abstractProperties } = tree;
    super(abstractProperties);
    this.key = key;
  }
}
