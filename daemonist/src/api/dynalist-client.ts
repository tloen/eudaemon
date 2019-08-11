import { API } from "./api-model";
import { APIDispatcher } from "./dispatcher";
import { DynalistModel } from "../dynalist/dynalist-model";
import * as _ from "lodash";
import { MutablePotentialNodeTree } from "../dynalist/tree-util";

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

  public async getMutableNodeTreeByKey(
    key: DynalistModel.NodeKey
  ): Promise<MutablePotentialNodeTree> {
    return new MutablePotentialNodeTree(await this.getNodeTree(key));
  }

  public applyChanges = async (newTrees: DynalistModel.PotentialNodeTree[]) => {
    console.log("applyChanges called...");
    for (const newTree of newTrees) {
      const oldTree = await this.getNodeTree(newTree.key);
      const rootAndAdditions: API.DocumentChange.NodeChange[] = [
        {
          action: "edit",
          node_id: oldTree.key.nodeId,
          content: "", // default
          ..._.pick<DynalistModel.PotentialNodeTree>(newTree, [
            "content",
            "note",
            "checked",
            "checkbox",
            "heading",
            "color"
          ])
        }
      ];

      // competitive programming habits die hard
      const parent: number[] = [-1];
      const flat: DynalistModel.AbstractNodeTree[] = [newTree];
      const index: number[] = [0];

      const bfs = (node: DynalistModel.AbstractNodeTree, idx: number) => {
        for (let i = 0; i < node.children.length; ++i) {
          const child = node.children[i];
          const childIdx = flat.length;
          flat.push(child);
          parent.push(idx);
          index.push(i);
          bfs(child, childIdx);
        }
      };
      bfs(newTree, 0);
      for (const child of flat.slice(1)) {
        const { content, note, checked, checkbox, heading, color } = child;
        rootAndAdditions.push({
          action: "insert",
          parent_id: newTree.key.nodeId,
          content: "", //default
          ..._.pick<DynalistModel.AbstractNodeTree>(child, [
            "content",
            "note",
            "checked",
            "checkbox",
            "heading",
            "color"
          ])
        });
      }
      const newKeys = [newTree.key].concat(
        await this.editDocument(newTree.key.documentId, rootAndAdditions)
      );
      const deletionsAndMoves: API.DocumentChange.NodeChange[] = [];
      for (const child of oldTree.children) {
        deletionsAndMoves.push({
          action: "delete",
          node_id: child.key.nodeId
        });
      }

      for (let i = 1; i < flat.length; ++i) {
        deletionsAndMoves.push({
          action: "move",
          node_id: newKeys[i].nodeId,
          parent_id: newKeys[parent[i]].nodeId,
          index: index[i]
        });
      }
      await this.editDocument(newTree.key.documentId, deletionsAndMoves);
    }
  };

  public editDocument = async (
    documentId: string,
    changes: API.DocumentChange.NodeChange[]
  ): Promise<DynalistModel.NodeKey[]> => {
    const response = await this.postFetch<
      API.DocumentChange.Request,
      API.DocumentChange.Response
    >(API.DocumentChange.ENDPOINT, {
      file_id: documentId,
      changes
    });
    return response.new_node_ids.map(nodeId => ({
      nodeId,
      documentId
    }));
  };

  public getNodeTree = async (
    key: DynalistModel.NodeKey
  ): Promise<DynalistModel.ConcreteNodeTree> => {
    console.log("getNodeTree called...");
    let document = await this.getDocumentById(key.documentId);
    const { nodes } = document;
    const nodeMap = new Map<string, DynalistModel.ConcreteNode>(
      nodes.map(
        (node): [string, DynalistModel.ConcreteNode] => [node.key.nodeId, node]
      )
    );
    function dfs(
      node: DynalistModel.ConcreteNode
    ): DynalistModel.ConcreteNodeTree {
      if (node.children.length === 0) return { ...node, children: [] };
      else
        return {
          ...node,
          children: node.children.map(({ nodeId }) => dfs(nodeMap.get(nodeId)))
        };
    }
    return dfs(nodeMap.get(key.nodeId));
  };

  public getAllNodes = async (): Promise<DynalistModel.ConcreteNode[]> => {
    const files = await this.getAllDocuments();
    const res = files.map(file => file.nodes).flat();
    return res;
  };

  // Limit: 60 reads per minute
  public getAllDocuments = async (): Promise<DynalistModel.Document[]> => {
    const files = await this.getFileTree();
    const documentIds = files
      .filter(
        file =>
          file.type === "document" &&
          (!this.debug || DEBUG_DOC_TITLES.includes(file.title))
      )
      .map(file => file.id);
    console.log(`Getting ${documentIds.length} documents...`);
    return Promise.all(documentIds.map(this.getDocumentById));
  };

  public getDocumentByTitle = async (
    title: string,
    enforceUnique?: boolean
  ): Promise<DynalistModel.Document> => {
    const files = await this.getFileTree();
    const matchingFiles = files.filter(
      file => file.type === "document" && file.title == title
    );
    if (matchingFiles.length == 0) return undefined;
    else if (enforceUnique && matchingFiles.length > 1)
      throw `Multiple files matching the given title (${title}) were found.`;
    else return this.getDocumentById(matchingFiles[0].id);
  };

  private transformNode = (
    rawNode: API.DocumentRead.Node,
    documentId: string
  ): DynalistModel.ConcreteNode => {
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

  public getDocumentById = async (
    documentId: string
  ): Promise<DynalistModel.Document> => {
    const body = await this.postFetch<
      API.DocumentRead.Request,
      API.DocumentRead.Response
    >(API.DocumentRead.ENDPOINT, {
      file_id: documentId
    });
    // strip extra nodes from document
    const nodes = body.nodes.map(rawNode =>
      this.transformNode(rawNode, documentId)
    );
    const nodeMap = new Map<string, DynalistModel.ConcreteNode>(
      nodes.map(
        (node): [string, DynalistModel.ConcreteNode] => [node.key.nodeId, node]
      )
    );
    const rootedIds = [];
    function dfs(nodeId: string) {
      for (const child of nodeMap.get(nodeId).children) {
        dfs(child.nodeId);
      }
      rootedIds.push(nodeId);
    }
    dfs("root");
    return {
      id: documentId,
      nodes: nodes.filter(node => rootedIds.includes(node.key.nodeId)),
      title: body.title
    };
  };

  public getFileTree = async (): Promise<DynalistModel.File[]> => {
    const body = await this.postFetch<
      API.GetFiles.Request,
      API.GetFiles.Response
    >(API.GetFiles.ENDPOINT);
    return body.files;
  };

  public editFile = async (fileId: string, title: string): Promise<void> => {
    const response = await this.postFetch<
      API.FileEdit.Request,
      API.FileEdit.Response
    >(API.FileEdit.ENDPOINT, {
      file_id: fileId,
      changes: [
        {
          action: "edit",
          type: "document",
          file_id: fileId,
          title
        }
      ]
    });
    if (!response.results[0]) throw "Edit failed";
  };

  private postFetch = async <Request, Response extends API.SuccessfulResponse>(
    url: string,
    params?: Request
  ): Promise<Response> => {
    console.log(`POST ${url} with params ${JSON.stringify(params)}`);
    const response = await this.dispatcher.fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: this.token, ...params }),
      method: "POST"
    });
    const body = await response.json();
    if (body._code !== "Ok") return Promise.reject(body._msg);
    else return body as Response;
  };
}
