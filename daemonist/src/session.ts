import {
  GetFilesResponse,
  ENDPOINTS,
  DocumentReadResponse,
  SuccessfulResponse
} from "./api";
import { Dynalist } from "./dynalist";
import fetch from "node-fetch";

interface FetchRequest {
  url: string;
  params?: any;
}

export class DynalistAPI {
  private token: string;
  // private fileTree: Dynalist.File[] | undefined;
  // private cache; // TODO

  constructor(token: string) {
    this.token = token;
  }

  // Limit: 60 times per minute
  public async readAllDocuments(): Promise<Dynalist.Document[]> {
    return this.getFileTree()
      .then(
        (files): Promise<DocumentReadResponse[]> => {
          const requests = files.map(
            (file): FetchRequest => ({
              url: ENDPOINTS.READ_DOCUMENT,
              params: {
                file_id: file.id
              }
            })
          );
          return this.batchPostFetch<DocumentReadResponse>(requests, 1500);
        }
      )
      .then(responses =>
        responses.map(response => {
          return {
            id: "abc",
            title: response.title,
            nodes: response.nodes
          };
        })
      );
  }

  public readDocument(documentId: string): Promise<Dynalist.Document> {
    return this.postFetch(ENDPOINTS.READ_DOCUMENT, {
      file_id: documentId
    }).then((body: DocumentReadResponse) => ({
      id: documentId,
      nodes: body.nodes,
      title: body.title
    }));
  }

  public getFileTree(): Promise<Dynalist.File[]> {
    return this.postFetch<GetFilesResponse>(ENDPOINTS.GET_FILES).then(
      body => body.files
    );
  }

  private async batchPostFetch<T extends SuccessfulResponse>(
    requests: FetchRequest[],
    waitMilliseconds: number
  ): Promise<T[]> {
    const results: T[] = [];
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
