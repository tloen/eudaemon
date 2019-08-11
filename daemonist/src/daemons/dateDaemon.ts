import { DynalistModel } from "../dynalist/dynalist-model";
import { NamedDaemon } from "../daemonist/daemon";
import { MutablePotentialNodeTree } from "../dynalist/tree-util";
import { MutableDaemonistNodeTree } from "../daemonist/daemon-node";

export class DateDaemon extends NamedDaemon<{}> {
  public defaultState = {};
  constructor(name?: string) {
    super(name || "date");
  }

  public transform = async (
    root: DynalistModel.PotentialNodeTree
  ): Promise<DynalistModel.PotentialNodeTree[]> => {
    const mutable_root = new MutableDaemonistNodeTree(root, this.defaultState);
    mutable_root.updateProperties({
      note: `${mutable_root.invocationString}\nLast updated ${Date()}`
    });
    return [await mutable_root];
  };
}
