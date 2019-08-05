import { DynalistModel } from "./dynalist-model";
import { Daemonist, INVOCATION } from "./daemonist";

export interface Daemon {
  transform: (
    root: DynalistModel.NodeTree
  ) => //daemonist: Daemonist // should I refactor this out?
  Promise<DynalistModel.NodeChange[]>;
  isSummoned: (root: DynalistModel.NodeTree) => boolean;
}

export abstract class NamedDaemon implements Daemon {
  constructor(public readonly name: string) {}

  public transform: (
    root: DynalistModel.NodeTree
  ) => Promise<DynalistModel.NodeChange[]>;

  public isSummoned = (root: DynalistModel.NodeTree): boolean =>
    INVOCATION.exec(root.note)[1]
      .split(`[, ]`)
      .includes(this.name);
}
