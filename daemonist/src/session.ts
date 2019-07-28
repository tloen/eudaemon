import {
  GetFilesResponse,
  ENDPOINTS,
  DocumentReadResponse,
  SuccessfulResponse,
  DocumentReadNode
} from "./api";
import { Dynalist } from "./dynalist";
import fetch from "node-fetch";

interface FetchRequest {
  url: string;
  params?: any;
}

export class DynalistAPI {
  private token: string;
  private cache: Cache;

  constructor(token: string) {
    this.token = token;
  }

  public getNodeForest(): Promise<Dynalist.Node[]> {
    return this.getAllDocuments().then(files =>
      files.map(file => file.nodes).flat()
    );
  }

  // Limit: 60 reads per minute
  public async getAllDocuments(): Promise<Dynalist.Document[]> {
    return this.getFileTree().then(files => {
      const documentFiles = files.filter(file => file.type === "document");

      const requests = documentFiles.map(
        (file): FetchRequest => ({
          url: ENDPOINTS.GET_DOCUMENT,
          params: {
            file_id: file.id
          }
        })
      );
      return this.batchPostFetch<DocumentReadResponse>(requests, 1200).then(
        responses =>
          responses.map((response, i) => ({
            id: documentFiles[i].id,
            title: response.title,
            nodes: response.nodes.map(rawNode =>
              this.transformNode(rawNode, documentFiles[i].id)
            )
          }))
      );
    });
  }

  public getDocumentByTitle(title: string): Promise<Dynalist.Document> {
    return this.getFileTree().then(files => {
      const matchingFiles = files.filter(
        file => file.type === "document" && file.title == title
      );
      if (matchingFiles.length == 0) return undefined;
      else return this.getDocumentById(matchingFiles[0].id);
    });
  }

  private transformNode(
    rawNode: DocumentReadNode,
    documentId: string
  ): Dynalist.Node {
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
  }

  public getDocumentById(documentId: string): Promise<Dynalist.Document> {
    return this.postFetch(ENDPOINTS.GET_DOCUMENT, {
      file_id: documentId
    }).then((body: DocumentReadResponse) => ({
      id: documentId,
      nodes: body.nodes.map(rawNode => this.transformNode(rawNode, documentId)),
      title: body.title
    }));
  }

  public getFileTree(): Promise<Dynalist.File[]> {
    return this.postFetch<GetFilesResponse>(ENDPOINTS.GET_FILES).then(
      body => body.files
    );
  }

  // TODO: merge this into getting all docs
  private async batchPostFetch<T extends SuccessfulResponse>(
    requests: FetchRequest[],
    waitMilliseconds: number
  ): Promise<T[]> {
    const results: T[] = [];
    console.log(
      `Got ${requests.length} requests with wait time ${waitMilliseconds /
        1000} seconds. Expect at least ${(requests.length * waitMilliseconds) /
        1000} seconds delay.`
    );
    for (const request of requests) {
      results.push(await this.postFetch<T>(request.url, request.params));
      await new Promise(_ => setTimeout(_, waitMilliseconds));
    }
    return results;
  }

  private postFetch<T extends SuccessfulResponse>(
    url: string,
    params?: any
  ): Promise<T> {
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
        else return body as T;
      });
  }
}
