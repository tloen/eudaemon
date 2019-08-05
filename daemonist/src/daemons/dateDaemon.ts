import { INVOCATION } from "../daemonist";
import { DynalistModel } from "../dynalist-model";
import { NamedDaemon } from "../daemon";
import { MutableConcreteNodeTree } from "../api/tree-util";

export class DateDaemon extends NamedDaemon {
  constructor(name?: string) {
    super(name || "date");
  }

  public transform = async (
    root: DynalistModel.PotentialNodeTree
  ): Promise<DynalistModel.PotentialNodeTree[]> => {
    const mutable_root = new MutableConcreteNodeTree(root);
    mutable_root.updateProperties({
      note: `${INVOCATION.exec(root.note)[0]}\n Last updated ${Date()}`
    });
    return [await mutable_root];
  };
}
