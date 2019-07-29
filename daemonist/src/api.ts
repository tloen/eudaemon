import { Dynalist } from "./dynalist";

export const ENDPOINTS = {
  GET_FILES: "https://dynalist.io/api/v1/file/list",
  GET_DOCUMENT: "https://dynalist.io/api/v1/doc/read",
  CREATE_FILE: "https://dynalist.io/api/file/create",
  EDIT_FILE: "https://dynalist.io/api/file/edit"
};

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

export interface GetFilesResponse extends SuccessfulResponse {
  root_file_id: string;
  files: Dynalist.File[];
}

export interface DocumentReadNode {
  id: string;
  content: string;
  note: string;
  created: number;
  modified: number;
  children: string[];

  checked?: boolean;
  checkbox?: boolean;
  color?: Dynalist.Color;
  heading?: Dynalist.HeadingLevel;
  collapsed?: boolean;
}

export interface DocumentReadResponse extends SuccessfulResponse {
  title: string;
  nodes: DocumentReadNode[];
}

export interface CreationRequest {
  document_count: number;
  folder_count: 0;
}

export interface CreationResponse extends SuccessfulResponse {
  folders: string[];
  documents: string[];
}

export interface FileEdit {
  action: "edit";
  type: Dynalist.FileType;
  file_id: string;
  title: string;
}

export interface FileMove {
  action: "move";
  type: Dynalist.FileType;
  file_id: string;
  parent_id: string;
  index: number;
}

export type FileChange = FileEdit | FileMove;

// TODO: namespace these!
export interface FileEditRequest {
  changes: FileChange[];
}

export interface FileEditResponse extends SuccessfulResponse {
  results: boolean[];
}
