import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ModalOpenService } from './modal-open.service';

function tick() {
  return new Promise<void>(resolve => setTimeout(resolve, 0));
}

async function settle() {
  for (let i = 0; i < 10; i++) {
    await tick();
  }
}

describe('ModalOpenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalOpenService],
    });
  });

  it('should construct', () => {
    const modalOpenService = TestBed.inject(ModalOpenService);

    expect(modalOpenService).not.toBeNull();
  });

  it('should run queued modals sequentially', async () => {
    const modalOpenService = TestBed.inject(ModalOpenService);

    const order: string[] = [];
    let resolveFirst: (() => void) | undefined;

    modalOpenService.openModal(() => {
      order.push('first opened');
      return new Promise<void>(resolve => {
        resolveFirst = resolve;
      });
    });
    modalOpenService.openModal(async () => {
      order.push('second opened');
    });

    await settle();
    expect(order).toEqual(['first opened']);
    expect(modalOpenService.isModalOpen).toBe(true);

    (resolveFirst as unknown as () => void)();
    await settle();
    expect(order).toEqual(['first opened', 'second opened']);
    expect(modalOpenService.isModalOpen).toBe(false);
  });

  it('should keep serving the queue after a modal promise rejects', async () => {
    const modalOpenService = TestBed.inject(ModalOpenService);

    modalOpenService.openModal(async () => {
      throw new Error('modal failed');
    });
    await settle();

    let secondOpened = false;
    modalOpenService.openModal(async () => {
      secondOpened = true;
    });
    await settle();

    expect(secondOpened).toBe(true);
    expect(modalOpenService.isModalOpen).toBe(false);
  });
});
