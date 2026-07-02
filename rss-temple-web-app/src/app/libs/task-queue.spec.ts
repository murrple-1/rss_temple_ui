import { describe, expect, it } from 'vitest';

import { AsyncTaskQueue } from './task-queue';

const noop = async () => {
  // intentionally empty
};

describe('AsyncTaskQueue', () => {
  it('exposes queued entries via the getter', () => {
    const queue = new AsyncTaskQueue();

    queue.pushPriority(noop, 1, 'a');
    queue.pushPriority(noop, 2, 'b');

    expect(queue.queueEntries).toHaveLength(2);
    expect(queue.queueEntries.map(qe => qe.tag).sort()).toEqual(['a', 'b']);
  });

  // Regression: the `queueEntries` setter used to assign `taskQueue.data`
  // directly, which left TinyQueue's separate `length` counter stale. The next
  // push/pop then indexed into an undefined heap slot and threw
  // `TypeError: Cannot read properties of undefined (reading 'priority')`,
  // permanently breaking the queue (hit on logout-reset then reuse in the same
  // session). Rebuilding the queue in the setter keeps `data` and `length` in
  // sync.
  it('stays usable after queueEntries is reset', () => {
    const queue = new AsyncTaskQueue();

    queue.pushPriority(noop, 1, 'refresh');
    expect(queue.queueEntries).toHaveLength(1);

    queue.queueEntries = [];
    expect(queue.queueEntries).toHaveLength(0);

    expect(() => queue.pushPriority(noop, 5, 'readSome')).not.toThrow();
    expect(queue.queueEntries).toHaveLength(1);
    expect(queue.queueEntries.some(qe => qe.tag === 'readSome')).toBe(true);
  });
});
