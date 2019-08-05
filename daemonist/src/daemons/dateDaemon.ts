import { INVOCATION } from "../daemonist";
import { DynalistModel } from "../dynalist-model";
import { NamedDaemon } from "../daemon";

export class DateDaemon extends NamedDaemon {
  constructor(name?: string) {
    super(name || "date");
  }

  public transform = (
    root: DynalistModel.NodeTree
  ): Promise<DynalistModel.NodeChange[]> =>
    Promise.resolve([
      {
        action: "edit",
        node_id: root.key.nodeId,
        note: `${INVOCATION.exec(root.note)[0]}\n Last updated ${Date()}`
      }
    ]);
}
