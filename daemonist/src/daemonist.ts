import { Dynalist } from "./dynalist";
import { DynalistAPI } from "./session";

const א = /[🏺😈👿🤖א]/;
const isActivated = (node: Dynalist.Node) => !!א.exec(node.note);
const INDEX_TITLE = "(א)";

export class Daemonist {
  private api: DynalistAPI;
  constructor(apiToken: string) {
    this.api = new DynalistAPI(apiToken);
  }

  public getActivatedNodeKeys(): Promise<Dynalist.NodeKey[]> {
    // definitely cacheable/indexable
    return this.api
      .getAllNodes()
      .then(nodes => nodes.filter(isActivated).map(node => node.key));
  }

  public getActivatedNodeTrees(): Promise<Dynalist.NodeTree[]> {
    // TODO: check for nested activated nodes
    return this.getActivatedNodeKeys().then(keys =>
      Promise.all(keys.map(this.api.getNodeTree))
    );
  }

  public getStateDocument(): Promise<Dynalist.Document> {
    return this.api
      .getDocumentByTitle(INDEX_TITLE, true)
      .then(
        response =>
          response ||
          this.api.createDocument(INDEX_TITLE).then(this.api.getDocumentById)
      );
  }
}
