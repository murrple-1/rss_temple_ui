import TinyQueue from 'tinyqueue';

interface QueueEntry {
  tag: string;
  priority: number;
  task: () => Promise<void>;
}

const queueEntryComparator = (a: QueueEntry, b: QueueEntry) =>
  a.priority < b.priority ? 1 : a.priority > b.priority ? -1 : 0;

export class AsyncTaskQueue {
  private taskQueue = new TinyQueue<QueueEntry>([], queueEntryComparator);
  private taskTimeoutId: number | null | false = false;

  get queueEntries() {
    return this.taskQueue.data;
  }

  set queueEntries(value: QueueEntry[]) {
    // Rebuild the queue rather than assigning `taskQueue.data` directly:
    // TinyQueue tracks its size in a separate `length` field that push/pop
    // rely on, and overwriting `data` alone leaves `length` stale, which
    // corrupts subsequent push/pop (indexing into undefined heap slots).
    this.taskQueue = new TinyQueue<QueueEntry>(value, queueEntryComparator);
  }

  constructor(private timeoutInterval = 0) {}

  startProcessing() {
    if (this.taskTimeoutId === null || this.taskTimeoutId === false) {
      this.taskTimeoutId = window.setTimeout(
        this.drainTasks.bind(this),
        this.timeoutInterval,
      );
    }
  }

  stopProcessing() {
    if (this.taskTimeoutId !== null && this.taskTimeoutId !== false) {
      window.clearTimeout(this.taskTimeoutId);
    }
    this.taskTimeoutId = false;
  }

  pushPriority(task: () => Promise<void>, priority: number, tag: string) {
    this.taskQueue.push({
      tag,
      priority,
      task,
    });
  }

  private async drainTasks() {
    if (this.taskTimeoutId !== null && this.taskTimeoutId !== false) {
      window.clearTimeout(this.taskTimeoutId);
      this.taskTimeoutId = null;
    }

    try {
      let task: QueueEntry | undefined;
      while ((task = this.taskQueue.pop()) !== undefined) {
        try {
          await task.task();
        } catch (reason: unknown) {
          console.error(reason);
        }
      }
    } finally {
      if (this.taskTimeoutId !== false) {
        this.taskTimeoutId = window.setTimeout(
          this.drainTasks.bind(this),
          this.timeoutInterval,
        );
      }
    }
  }
}
