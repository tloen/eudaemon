import { DynalistModel } from "../dynalist/dynalist-model";
import { unpackDynalistLink, yesterday } from "../daemonist/util";
import { DynalistClient } from "../api/dynalist-client";
import { MutableNodeTree } from "../dynalist/tree-util";

export interface LoggerState {
  lastRun: Date;
}

export class Logger {
  destinationNodeKey: DynalistModel.NodeKey;
  clears: boolean;

  static attemptConstruct(nodeTree: MutableNodeTree): Logger | null {
    try {
      return new Logger(nodeTree);
    } catch {
      return null;
    }
  }

  static parseClears(note: string): boolean {
    return note.includes("and clears");
  }

  async getChange(
    client: DynalistClient
  ): Promise<DynalistModel.PotentialNodeTree> {
    const dstTree = await client.getMutableNodeTreeByKey(
      this.destinationNodeKey
    );
    const logEntry = this.nodeTree.deepClone();
    logEntry.updateProperties({
      content: yesterday().toLocaleDateString(),
      note: ""
    });

    dstTree.pushSubtree(logEntry);
    return dstTree;
  }

  constructor(public nodeTree: MutableNodeTree) {
    if (
      !nodeTree.note ||
      !nodeTree.note.toLowerCase().startsWith("writes to") ||
      !unpackDynalistLink(nodeTree.note)
    )
      throw new Error("Not a logger node. Use canConstruct!");
    this.destinationNodeKey = unpackDynalistLink(nodeTree.note);
    this.clears = Logger.parseClears(nodeTree.note);
  }
}
