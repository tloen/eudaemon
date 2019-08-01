import { INVOCATION } from "../daemonist";
import { Dynalist } from "../dynalist";
import { NamedDaemon } from "../daemon";

export class DateDaemon extends NamedDaemon {
  constructor(name?: string) {
    super(name || "date");
  }

  public transform = (
    root: Dynalist.NodeTree
  ): Promise<Dynalist.NodeChange[]> =>
    Promise.resolve([
      {
        action: "edit",
        node_id: root.key.nodeId,
        note: `${INVOCATION.exec(root.note)[0]}\n Last updated ${Date()}`
      }
    ]);
}
