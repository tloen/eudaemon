import { Dynalist } from "./dynalist";
import { Daemonist, INVOCATION } from "./daemonist";

export interface Daemon {
  transform: (
    root: Dynalist.NodeTree
  ) => //daemonist: Daemonist // should I refactor this out?
  Promise<Dynalist.NodeChange[]>;
  isSummoned: (root: Dynalist.NodeTree) => boolean;
}

export abstract class NamedDaemon implements Daemon {
  constructor(public readonly name: string) {}

  public transform: (root: Dynalist.NodeTree) => Promise<Dynalist.NodeChange[]>;

  public isSummoned = (root: Dynalist.NodeTree): boolean =>
    INVOCATION.exec(root.note)[1]
      .split(`[, ]`)
      .includes(this.name);
}
