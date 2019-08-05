import { API } from "./api-model";
import { APIDispatcher } from "./dispatcher";
import { DynalistModel } from "../dynalist-model";
import fetch from "node-fetch";

interface FetchRequest {
  url: string;
  params?: any;
}

const DEBUG_DOC_TITLES: string[] = ["__debug"];
export class DynalistClient {
  private dispatcher: APIDispatcher;

  constructor(private token: string, private readonly debug: boolean = false) {
    this.token = token;
    this.debug = debug;
    this.dispatcher = new APIDispatcher();
  }

  public editDocument = (
    documentId: string,
    changes: DynalistModel.NodeChange[]
  ): Promise<DynalistModel.NodeKey[]> => {
    return this.postFetch<
      API.DocumentChange.Request,
      API.DocumentChange.Response
    >(API.DocumentChange.ENDPOINT, {
      file_id: documentId,
      changes
    }).then(response =>
      response.new_node_ids.map(nodeId => ({
        nodeId,
        documentId
      }))
    );
  };

  public getNodeTree = (
    key: DynalistModel.NodeKey
  ): Promise<DynalistModel.NodeTree> => {
    return this.getDocumentById(key.documentId).then(document => {
      const { nodes } = document;
      const nodeMap = new Map<string, DynalistModel.Node>(
        nodes.map(
          (node): [string, DynalistModel.Node] => [node.key.nodeId, node]
        )
      );
      function dfs(node: DynalistModel.Node): DynalistModel.NodeTree {
        if (node.children.length === 0) return { ...node, children: [] };
        else
          return {
            ...node,
            children: node.children.map(({ nodeId }) =>
              dfs(nodeMap.get(nodeId))
            )
          };
      }
      return dfs(nodeMap.get(key.nodeId));
    });
  };

  public getAllNodes = (): Promise<DynalistModel.Node[]> => {
    return this.getAllDocuments()
      .then(files => files.map(file => file.nodes).flat())
      .then(res => {
        return res;
      });
  };

  // Limit: 60 reads per minute
  public getAllDocuments = (): Promise<DynalistModel.Document[]> => {
    return this.getFileTree().then(files => {
      const documentIds = files
        .filter(
          file =>
            file.type === "document" &&
            (!this.debug || DEBUG_DOC_TITLES.includes(file.title))
        )
        .map(file => file.id);

      return Promise.all(documentIds.map(this.getDocumentById));
    });
  };

  public getDocumentByTitle = (
    title: string,
    enforceUnique?: boolean
  ): Promise<DynalistModel.Document> => {
    return this.getFileTree().then(files => {
      const matchingFiles = files.filter(
        file => file.type === "document" && file.title == title
      );
      if (matchingFiles.length == 0) return undefined;
      else if (enforceUnique && matchingFiles.length > 1)
        throw `Multiple files matching the given title (${title}) were found.`;
      else return this.getDocumentById(matchingFiles[0].id);
    });
  };

  private transformNode = (
    rawNode: API.DocumentRead.Node,
    documentId: string
  ): DynalistModel.Node => {
    return {
      ...rawNode,
      key: {
        documentId,
        nodeId: rawNode.id
      },
      created: new Date(rawNode.created),
      modified: new Date(rawNode.modified),
      children: rawNode.children
        ? rawNode.children.map(nodeId => ({
            documentId,
            nodeId
          }))
        : []
    };
  };

  public getDocumentById = (
    documentId: string
  ): Promise<DynalistModel.Document> => {
    return this.postFetch<API.DocumentRead.Request, API.DocumentRead.Response>(
      API.DocumentRead.ENDPOINT,
      {
        file_id: documentId
      }
    ).then(body => ({
      id: documentId,
      nodes: body.nodes.map(rawNode => this.transformNode(rawNode, documentId)),
      title: body.title
    }));
  };

  public getFileTree = (): Promise<DynalistModel.File[]> => {
    return this.postFetch<API.GetFiles.Request, API.GetFiles.Response>(
      API.GetFiles.ENDPOINT
    ).then(body => body.files);
  };

  public editFile = (fileId: string, title: string): Promise<void> => {
    return this.postFetch<API.FileEdit.Request, API.FileEdit.Response>(
      API.FileEdit.ENDPOINT,
      {
        file_id: fileId,
        changes: [
          {
            action: "edit",
            type: "document",
            file_id: fileId,
            title
          }
        ]
      }
    ).then(response => {
      if (!response.results[0]) throw "Edit failed";
    });
  };

  private postFetch = <Request, Response extends API.SuccessfulResponse>(
    url: string,
    params?: Request
  ): Promise<Response> => {
    console.log(`POST ${url} with params ${JSON.stringify(params)}`);
    return fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: this.token, ...params }),
      method: "POST"
    })
      .then(response => response.json())
      .then(body => {
        if (body._code !== "Ok") return Promise.reject(body._msg);
        else return body as Response;
      });
  };
}
