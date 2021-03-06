import { DynalistModel } from "../dynalist/dynalist-model";
import { DynalistClient } from "../api/dynalist-client";
import { Daemon } from "./daemon";
import { MutableDaemonistNodeTree } from "./daemon-node";
import { MutablePotentialNodeTree } from "../dynalist/tree-util";

export const INVOCATION = /#?[🏺😈👿🤖]\(([a-zA-Z, 0-9_]*)\)/u;
const isActivated = (node: DynalistModel.ConcreteNode) =>
  INVOCATION.exec(node.note) !== null;
export const STATE = /\[(.*)\]\(㊙️\)/;

export class Daemonist {
  public api: DynalistClient;
  public daemons: Daemon[] = [];

  constructor(apiToken: string, debug: boolean = false) {
    this.api = new DynalistClient(apiToken, debug);
  }

  public registerDaemon(daemon: Daemon) {
    this.daemons.push(daemon);
  }

  public runAllDaemons = async (): Promise<void> => {
    for (const daemon of this.daemons) {
      await this.runDaemon(daemon);
    }
  };

  public runDaemon = async (daemon: Daemon): Promise<void> => {
    console.log("Running daemon...");
    const trees = await this.getActivatedNodeTrees();
    console.log("Got activate node trees.");
    await Promise.all(
      trees.map(tree =>
        daemon
          .transform(
            new MutableDaemonistNodeTree(tree, daemon.defaultState),
            this.api
          )
          .then(this.api.applyChanges)
      )
    );
  };

  private async getActivatedNodeTrees(): Promise<
    DynalistModel.ConcreteNodeTree[]
  > {
    console.log("Getting activated node trees...");
    // TODO: check for nested activated nodes
    const keys = await this.getActivatedNodeKeys();
    console.log(`Got ${keys.length} keys.`);
    for (const key of keys) {
      console.log(key);
    }
    const trees = await Promise.all(keys.map(this.api.getNodeTree));
    console.log(`Got ${trees.length} trees.`);
    return trees;
  }

  private activatedNodeKeyCache:
    | DynalistModel.NodeKey[]
    | undefined = undefined;
  private getActivatedNodeKeys = (): Promise<DynalistModel.NodeKey[]> => {
    // definitely cacheable/indexable
    return this.activatedNodeKeyCache
      ? Promise.resolve(this.activatedNodeKeyCache)
      : this.api
          .getAllNodes()
          .then(
            nodes =>
              (this.activatedNodeKeyCache = nodes
                .filter(isActivated)
                .map(node => node.key))
          );
  };
}
