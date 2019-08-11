import { DynalistModel } from "../dynalist/dynalist-model";
import { DynalistClient } from "../api/dynalist-client";
import { MutableDaemonistNodeTree, DaemonState } from "./daemon-node";
import { Daemonist } from "./daemonist";

export interface Daemon<State extends DaemonState = DaemonState> {
  defaultState: State;
  transform: (
    root: MutableDaemonistNodeTree<State>,
    client: DynalistClient
  ) => //daemonist: Daemonist // should I refactor this out?
  Promise<DynalistModel.PotentialNodeTree[]>;
  isSummoned: (root: DynalistModel.ConcreteNodeTree) => boolean;
}

export abstract class NamedDaemon<State extends DaemonState = DaemonState>
  implements Daemon<State> {
  constructor(public readonly name: string) {}

  public abstract defaultState;

  public abstract transform: (
    root: MutableDaemonistNodeTree<State>,
    client: DynalistClient
  ) => Promise<DynalistModel.PotentialNodeTree[]>;

  public isSummoned = (root: DynalistModel.ConcreteNodeTree): boolean => {
    // TODO: refactor into recursive wrappers
    const tree = new MutableDaemonistNodeTree(root, this.defaultState);
    return (
      tree.isActivated &&
      tree.invocationString.split(`[, ]`).includes(this.name)
    );
  };
}
