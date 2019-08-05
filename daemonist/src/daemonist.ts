import { DynalistModel } from "./dynalist-model";
import { DynalistClient } from "./api/dynalist-client";
import { Daemon } from "./daemon";

export const INVOCATION = /#?[🏺😈👿🤖]\((.*)\)/u;
const isActivated = (node: DynalistModel.Node) => !!INVOCATION.exec(node.note);
const INDEX_TITLE = "(א)";

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

  public runDaemon = (daemon: Daemon): Promise<void> =>
    this.getActivatedNodeTrees()
      .then(trees =>
        Promise.all(
          trees.map(tree =>
            daemon
              .transform(tree)
              .then(changes =>
                this.api.editDocument(tree.key.documentId, changes)
              )
          )
        )
      )
      .then(() => {});

  private getActivatedNodeTrees(): Promise<DynalistModel.NodeTree[]> {
    // TODO: check for nested activated nodes
    return this.getActivatedNodeKeys().then(keys =>
      Promise.all(keys.map(this.api.getNodeTree))
    );
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

  private getStateDocument(): Promise<DynalistModel.Document> {
    return this.api.getDocumentByTitle(INDEX_TITLE, true);
  }
}
