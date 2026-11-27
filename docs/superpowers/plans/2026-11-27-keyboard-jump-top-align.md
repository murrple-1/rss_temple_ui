# Keyboard Jump Top-Align Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After J or K in the reader, the focused entry's headline is always at the top of the reading area.

**Architecture:** `AbstractFeedsComponent.moveFocus` always scrolls the entry to the top of the scroll container
and records the resulting `scrollTop`. While the container is still at that recorded position,
`onEntryEnteredViewport` is ignored, so entries showing below are not marked read. A spacer after the footer in
both feed templates gives the last entries room to reach the top.

**Tech Stack:** Angular 21, TypeScript, vitest with jsdom (`yarn test --no-watch`), Clarity UI.

**Spec:** `docs/superpowers/specs/2026-11-27-keyboard-jump-top-align-design.md`

## Global Constraints

- Run all commands in `rss-temple-web-app/`. Use yarn, not npm.
- Branch is `feat/keyboard-jump-top-align`. Do not commit to `master`. Do not create tags.
- Top-aligned means the entry's top is 8px below the scroll container's top (the existing `topAlignTop` value).
- The jump stays instant: `scrollTo({ top })` with no `behavior`.
- No change to mouse, touch or scrollbar scrolling behaviour, entry layout, or settings.
- "Load more" must start at the same scroll position as today.
- Commit subjects are short and imperative. End each commit message with
  `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`.
- Prettier: single quotes, trailing commas, `arrowParens: avoid`.

## Review Focus

1. J on an entry that is already fully visible: it must still scroll to the top. (Task 1 test.)
2. J on the first entry with the "Feed Settings" bar above it, and K back to index 0: target `top` must never be
   negative. (Task 1 test.)
3. After a jump, a viewport event for another entry at the same `scrollTop` must not move the focus or mark it
   read; after the reader scrolls, it must. (Task 1 tests.)
4. `r` (reload) after a jump: the recorded position must be cleared so the fresh list behaves normally.
   (Task 1 test.)
5. Last entry on a tall monitor (reading area taller than 1024px): it must reach the top, and "load more" must
   still fire. (Task 2 test for the bindings, Task 3 manual check.)

---

### Task 1: Always top-align, and ignore viewport events at the jump position

**Files:**
- Modify: `src/app/routes/main/components/shared/abstract-feeds/abstract-feeds.component.ts` (`onEntryEnteredViewport`, `reload`, `moveFocus`, the static scroll helpers, the `j`/`k` cases)
- Test: `src/app/routes/main/components/feeds/feeds.component.spec.ts`

**Interfaces:**
- Produces: `private jumpScrollTop: number | null` on `AbstractFeedsComponent`;
  `moveFocus(indexFn: (currentIndex: number, listLength: number) => number): void`.

- [ ] **Step 1: Write the failing tests**

Add to `feeds.component.spec.ts`, replacing the `// TODO more tests` line. Use this helper inside the `describe`.
jsdom has no layout, so rects and `scrollTo` are stubbed.

```ts
function setup(entryTops: number[]) {
  const mockUserCategoryService = TestBed.inject(
    UserCategoryService,
  ) as MockedObject<UserCategoryService>;
  mockUserCategoryService.queryAll.mockReturnValue(
    of({ objects: [], totalCount: 0 }),
  );

  const componentFixture = TestBed.createComponent(FeedsComponent);
  const component = componentFixture.componentInstance;
  componentFixture.detectChanges();

  const container = (
    component as unknown as {
      feedEntryViewsScollContainer: { nativeElement: HTMLElement };
    }
  ).feedEntryViewsScollContainer.nativeElement;
  // container: top 100, height 600
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 100, 800, 600),
  );
  container.scrollTo = vi.fn((options: ScrollToOptions) => {
    container.scrollTop = options.top ?? 0;
  }) as unknown as typeof container.scrollTo;

  const views = entryTops.map(top => ({
    autoRead: vi.fn(),
    feedEntry: undefined,
    elementRef: {
      nativeElement: {
        getBoundingClientRect: () => new DOMRect(0, top, 800, 50),
      },
    },
  }));
  (component as unknown as { feedEntryViews: unknown }).feedEntryViews = {
    toArray: () => views,
  };

  const press = (key: string) =>
    component.handleKeyPress(new KeyboardEvent('keypress', { key }));

  return { component, container, views, press };
}
```

Tests (entry tops are viewport coordinates; the container top is 100 and `scrollTop` starts at 0):

```ts
it('should top-align on "j" even when the entry is fully visible', () => {
  const { component, container, views, press } = setup([300, 360, 420]);
  component.focusedFeedEntryView = views[0] as never;
  press('j');
  expect(component.focusedFeedEntryView).toBe(views[1]);
  expect(views[1]?.autoRead).toHaveBeenCalled();
  // 360 + 0 - 100 - 8
  expect(container.scrollTo).toHaveBeenCalledWith({ top: 252 });
});

it('should top-align on "k"', () => {
  const { component, container, views, press } = setup([300, 360, 420]);
  component.focusedFeedEntryView = views[2] as never;
  press('k');
  expect(component.focusedFeedEntryView).toBe(views[1]);
  expect(container.scrollTo).toHaveBeenCalledWith({ top: 252 });
});

it('should not scroll to a negative position', () => {
  const { container, press } = setup([104, 164]);
  press('j'); // no focus yet -> index 0; 104 + 0 - 100 - 8 = -4
  expect(container.scrollTo).toHaveBeenCalledWith({ top: 0 });
});

it('should ignore viewport events at the jump position', () => {
  const { component, views, press } = setup([300, 360, 420]);
  component.focusedFeedEntryView = views[0] as never;
  press('j');
  component.onEntryEnteredViewport(
    { isInViewport: true } as never,
    views[2] as never,
  );
  expect(component.focusedFeedEntryView).toBe(views[1]);
  expect(views[2]?.autoRead).not.toHaveBeenCalled();
});

it('should honour viewport events after a manual scroll', () => {
  const { component, container, views, press } = setup([300, 360, 420]);
  component.focusedFeedEntryView = views[0] as never;
  press('j');
  container.scrollTop += 40;
  component.onEntryEnteredViewport(
    { isInViewport: true } as never,
    views[2] as never,
  );
  expect(component.focusedFeedEntryView).toBe(views[2]);
  expect(views[2]?.autoRead).toHaveBeenCalled();
  // and it stays honoured if the reader scrolls back to the jump position
  container.scrollTop -= 40;
  component.onEntryEnteredViewport(
    { isInViewport: true } as never,
    views[0] as never,
  );
  expect(component.focusedFeedEntryView).toBe(views[0]);
});

it('should honour viewport events after a reload', () => {
  const { component, views, press } = setup([300, 360, 420]);
  component.focusedFeedEntryView = views[0] as never;
  press('j');
  press('r');
  component.onEntryEnteredViewport(
    { isInViewport: true } as never,
    views[2] as never,
  );
  expect(component.focusedFeedEntryView).toBe(views[2]);
});
```

If `press('r')` triggers real loading in `FeedsComponent.reload()`, make `FeedEntryService.query` and any other
mock it calls return an empty `of(...)` result in that test.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `yarn test --no-watch`
Expected: the first, third and fourth new tests fail (no scroll for a visible entry, no clamp, focus stolen).
The others may already pass.

- [ ] **Step 3: Implement in `abstract-feeds.component.ts`**

- Add `private jumpScrollTop: number | null = null;`.
- `moveFocus(indexFn)`: remove the `scrollToTopFn` parameter and the `rectContainsRect` check. Always call
  `scrollTo({ top: Math.max(0, AbstractFeedsComponent.topAlignTop(entryRect, containerRect, scrollTop)) })`,
  then set `this.jumpScrollTop` to the container's `scrollTop` read back after the call.
- `onEntryEnteredViewport`: before the existing body, if `jumpScrollTop !== null`: when
  `Math.abs(container.scrollTop - jumpScrollTop) < 1`, return; otherwise set `jumpScrollTop = null` and continue.
- `reload()`: set `jumpScrollTop = null`.
- `j` and `k` cases: pass only the index function.
- Delete `scrollToTopUp`, `scrollToTopDown`, `bottomAlignTop` and `rectContainsRect`.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `yarn test --no-watch`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/main/components/shared/abstract-feeds/abstract-feeds.component.ts \
  src/app/routes/main/components/feeds/feeds.component.spec.ts
git commit -m "Feeds: always top-align the entry on J/K"
```

### Task 2: Room below the list

**Files:**
- Modify: `src/app/routes/main/components/feeds/feeds.component.html`
- Modify: `src/app/routes/main/components/feed/feed.component.html`
- Test: `src/app/routes/main/components/feeds/feeds.component.spec.ts`, `src/app/routes/main/components/feed/feed.component.spec.ts`

**Interfaces:**
- Consumes: the `#scrollContainer` template reference that both templates already have.
- Produces: an element with class `app--jump-spacer` as the last child of the scroll container.

- [ ] **Step 1: Write the failing tests**

In each of the two spec files, one test, built like the existing "should create the component" test:

```ts
it('should render the jump spacer last in the scroll container', async () => {
  // ...create the component as in 'should create the component'...
  const contentArea = (
    componentFixture.nativeElement as HTMLElement
  ).querySelector('.content-area');
  expect(
    contentArea?.lastElementChild?.classList.contains('app--jump-spacer'),
  ).toBe(true);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `yarn test --no-watch`
Expected: the two new tests fail (no spacer).

- [ ] **Step 3: Add the spacer and keep the load-more trigger point, in both templates**

- After the `clr-row` that holds `<app-feeds-footer>`, as the last child of the `#scrollContainer` div:
  `<div class="app--jump-spacer" aria-hidden="true" [style.height.px]="scrollContainer.clientHeight"></div>`
- Change `[appInfiniteScrollOffset]="1024"` to `[appInfiniteScrollOffset]="1024 + scrollContainer.clientHeight"`.

Both bindings read the same value, so the directive's check
(`scrollHeight - offset <= scrollTop + clientHeight`) gives the same result as before the spacer existed.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `yarn test --no-watch`
Expected: all tests pass, with no `ExpressionChangedAfterItHasBeenChecked` error in the output.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/main/components/feeds src/app/routes/main/components/feed
git commit -m "Feeds: add room below the list so the last entry can top-align"
```

### Task 3: Verify

- [ ] **Step 1: Run the definition of done**

Run: `yarn test --no-watch && yarn lint && yarn lint:templates && npx prettier --check .`
Expected: all pass. (`yarn lint:templates` needs djLint from `requirements-dev.txt`.)

- [ ] **Step 2: Check in the browser against a local backend**

Ask Murray to start the backend (`localhost:8000`), then `yarn start` and open `http://localhost:4200`. On both
the all-feeds page and a single-feed page, confirm:

- J on short, tall, first and last entries: headline always at the same height.
- K back up: same height.
- After J, the entries showing below the focused one are still unread; the next J goes to the very next entry.
- After J, scroll with the mouse: visible entries are marked read as before.
- Scrolling or pressing J towards the end still loads more entries. Check in a tall window too.
- The console shows no `ExpressionChangedAfterItHasBeenChecked` error, including after resizing the window.

- [ ] **Step 3: Fix anything found, re-run Step 1, commit**
