import TinyQueue from 'tinyqueue';

interface QueueEntry {
  tag: string;
  priority: number;
  task: () => Promise<void>;
}

export class AsyncTaskQueue {
  private taskQueue = new TinyQueue<QueueEntry>([], (a, b) =>
    a.priority < b.priority ? 1 : a.priority > b.priority ? -1 : 0,
  );
  private taskTimeoutId: number | null | false = false;

  get queueEntries() {
    return this.taskQueue.data;
  }

  set queueEntries(value: QueueEntry[]) {
    this.taskQueue.data = value;
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
        // TODO remove
        console.log(`${task.tag} - start`);
        try {
          await task.task();
          // TODO remove
          console.log(`${task.tag} - end`);
        } catch (reason: unknown) {
          // TODO remove
          console.log(`${task.tag} - error`);
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
