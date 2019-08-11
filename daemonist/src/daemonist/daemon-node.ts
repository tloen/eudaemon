import { MutablePotentialNodeTree } from "../dynalist/tree-util";
import { INVOCATION, STATE } from "./daemonist";
import { DynalistModel } from "../dynalist/dynalist-model";

export interface DaemonState {
  displayNote?: string;
}

export class MutableDaemonistNodeTree<
  State extends DaemonState = DaemonState
> extends MutablePotentialNodeTree {
  constructor(tree: DynalistModel.PotentialNodeTree, defaultState: State) {
    super(tree);
    if (!this.hasState && defaultState) {
      this.setState(defaultState);
    }
  }
  get state(): State | null {
    try {
      return {
        ...JSON.parse(STATE.exec(this.note)[1])
      };
    } catch {
      return null;
    }
  }
  get encodedState() {
    return STATE.exec(this.note)[0];
  }
  get isActivated() {
    return INVOCATION.exec(this.note) !== null;
  }
  get invocationString() {
    return INVOCATION.exec(this.note)[0];
  }
  get invocationParameters() {
    return INVOCATION.exec(this.note)[1];
  }
  get hasState() {
    return !!this.state;
  }

  private encodeState = (state: State) => `[${JSON.stringify(state)}](㊙️)`;

  setState(state: State) {
    this.note = `${this.invocationString}${this.encodeState(state)}${(this
      .state &&
      this.state.displayNote &&
      `\n${this.state.displayNote}`) ||
      ""}`;
  }

  updateState(updates: Partial<State>) {
    if (!this.state) {
      throw Error("State not initialized!");
    }
    this.setState({
      ...this.state,
      ...updates
    });
  }
}
