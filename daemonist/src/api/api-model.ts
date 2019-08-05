/* Representations of Dynalist API calls. */

import { DynalistModel } from "../dynalist-model";

export namespace API {
  type FailCode =
    | "Invalid"
    | "TooManyRequests"
    | "InvalidToken"
    | "LockFail"
    | "Unauthorized"
    | "NotFound"
    | "NodeNotFound"
    | "NoInbox";

  type SuccessCode = "OK";

  export interface SuccessfulResponse {
    _code: SuccessCode;
  }

  export interface FailedResponse {
    _code: FailCode;
    _msg: string;
  }

  export type APIResponse = SuccessfulResponse | FailedResponse;

  export namespace GetFiles {
    export const ENDPOINT = "https://dynalist.io/api/v1/file/list";
    export interface Request {}

    export interface Response extends SuccessfulResponse {
      root_file_id: string;
      files: DynalistModel.File[];
    }
  }

  export namespace DocumentRead {
    export const ENDPOINT = "https://dynalist.io/api/v1/doc/read";

    export interface Request {
      file_id: string;
    }

    export interface Response extends SuccessfulResponse {
      title: string;
      nodes: Node[];
    }

    export interface Node {
      id: string;
      content: string;
      note: string;
      created: number;
      modified: number;
      children: string[];

      checked?: boolean;
      checkbox?: boolean;
      color?: DynalistModel.Color;
      heading?: DynalistModel.HeadingLevel;
      collapsed?: boolean;
    }
  }

  export namespace FileEdit {
    export const ENDPOINT = "https://dynalist.io/api/file/edit";

    export interface FileEditChange {
      action: "edit";
      type: DynalistModel.FileType;
      file_id: string;
      title: string;
    }

    export interface FileMoveChange {
      action: "move";
      type: DynalistModel.FileType;
      file_id: string;
      parent_id: string;
      index: number;
    }

    export type FileChange = FileEditChange | FileMoveChange;

    export interface Request {
      file_id: string;
      changes: FileChange[];
    }

    export interface Response extends SuccessfulResponse {
      results: boolean[];
    }
  }

  export namespace DocumentChange {
    export const ENDPOINT = "https://dynalist.io/api/v1/doc/edit";

    export interface Request {
      file_id: string;
      changes: DynalistModel.NodeChange[];
    }

    export interface Response extends SuccessfulResponse {
      file_id: string;
      new_node_ids: string[];
    }
  }
}
