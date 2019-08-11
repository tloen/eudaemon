import { NamedDaemon } from "../daemonist/daemon";
import { DynalistModel } from "../dynalist/dynalist-model";
import {
  MutableDaemonistNodeTree,
  DaemonState
} from "../daemonist/daemon-node";
import { Logger, LoggerState } from "./logger";
import { Daemonist } from "../daemonist/daemonist";
import { DynalistClient } from "../api/dynalist-client";

export interface DashboardDaemonState extends DaemonState {
  [childIndex: number]: LoggerState; // TODO: use children as concrete
}

export class DashboardDaemon extends NamedDaemon<DashboardDaemonState> {
  constructor() {
    super("dashboard");
  }

  defaultState: DashboardDaemonState = {};

  transform = async (
    root: MutableDaemonistNodeTree<DashboardDaemonState>,
    client: DynalistClient
  ): Promise<DynalistModel.PotentialNodeTree[]> => {
    const now = new Date();
    const newTrees: DynalistModel.PotentialNodeTree[] = [];
    for (let index = 0; index < root.children.length; ++index) {
      const child = root.children[index];
      const logger = Logger.attemptConstruct(child);
      if (
        logger &&
        (!root.state[index] ||
          now.toLocaleDateString() !==
            new Date(root.state[index].lastRun).toLocaleDateString())
      ) {
        // run logger
        console.log(`Running logger on child ${index}`);
        newTrees.push(await logger.getChange(client));
        if (logger.clears) child.children = [];
        root.updateState({ [index]: { lastRun: new Date() } });
      }
    }
    newTrees.push(root);
    return newTrees;
  };
}
