import { Dynalist } from "./dynalist";

export const ENDPOINTS = {
  GET_FILES: "https://dynalist.io/api/v1/file/list",
  GET_DOCUMENT: "https://dynalist.io/api/v1/doc/read"
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
