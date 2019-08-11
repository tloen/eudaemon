import { DynalistModel } from "./dynalist-model";

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
    Object.assign(this, transformedTree); // sigh
  }

  public updateProperties(props: Partial<DynalistModel.AbstractNodeTree>) {
    Object.assign(this, props);
  }

  public removeChild(index: number) {
    this.children.splice(index, 1);
  }

  public pushSubtree(tree: DynalistModel.AbstractNodeTree) {
    this.children.push(new MutableNodeTree(tree));
  }

  public deepClone(): MutableNodeTree {
    var clone = new MutableNodeTree(this);
    for (let child of clone.children) {
      child = child.deepClone();
    }
    return clone;
  }
}

export class MutablePotentialNodeTree extends MutableNodeTree
  implements DynalistModel.PotentialNodeTree {
  key: DynalistModel.NodeKey;

  constructor(tree: DynalistModel.PotentialNodeTree) {
    const { key, ...abstractProperties } = tree;
    super(abstractProperties);
    this.key = key;
  }
}
