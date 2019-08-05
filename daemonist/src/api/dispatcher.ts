// Staggers requests to prevent quota issues.

export class APIDispatcher {
  // If necessary, we can split this into multiple queues.
  private queue: Promise<void> = Promise.resolve();

  constructor(private cooldownMs: number = 1500) {}

  public fetch = async (url: RequestInfo, init?: RequestInit): Promise<any> => {
    const fetched = this.queue.then(_ => fetch(url, init));
    this.queue = new Promise(_ => setTimeout(_, this.cooldownMs));
    return fetched;
  };
}
