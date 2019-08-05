import { DynalistModel } from "./dynalist-model";
import { Daemonist, INVOCATION } from "./daemonist";
import { API } from "./api/api-model";
import { DynalistClient } from "./api/dynalist-client";

export interface Daemon {
  transform: (
    root: DynalistModel.ConcreteNodeTree,
    client: DynalistClient
  ) => //daemonist: Daemonist // should I refactor this out?
  Promise<DynalistModel.PotentialNodeTree[]>;
  isSummoned: (root: DynalistModel.AbstractNodeTree) => boolean;
}

export abstract class NamedDaemon implements Daemon {
  constructor(public readonly name: string) {}

  public transform: (
    root: DynalistModel.ConcreteNodeTree,
    client: DynalistClient
  ) => Promise<DynalistModel.PotentialNodeTree[]>;

  public isSummoned = (root: DynalistModel.AbstractNodeTree): boolean =>
    INVOCATION.exec(root.note)[1]
      .split(`[, ]`)
      .includes(this.name);
}
