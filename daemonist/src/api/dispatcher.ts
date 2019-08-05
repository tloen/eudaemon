// Staggers requests to prevent quota issues.
import fetch from "node-fetch";

export class APIDispatcher {
  // If necessary, we can split this into multiple queues.
  private queue: Promise<void> = Promise.resolve();

  constructor(private cooldownMs: number = 2000) {}

  public fetch = async (url: string, init?: any): Promise<any> => {
    const fetched = this.queue.then(_ => fetch(url, init));
    this.queue = fetched.then(
      _ =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, this.cooldownMs);
        })
    );
    return fetched;
  };
}
