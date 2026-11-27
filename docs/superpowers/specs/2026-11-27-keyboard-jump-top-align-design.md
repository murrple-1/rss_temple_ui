# Keyboard jump: pin the entry's headline to the top

## Intent

When the reader presses J or K in the web app, the entry they land on must always have its headline at the same
place: the top of the reading area. Today a short entry lands at the bottom of the screen and a tall one at the
top, so the reader's eyes have to hunt for the headline after every jump. Feedly is the reference for the
behaviour wanted.

## Goals

- After J or K, the top of the focused entry is 8px below the top of the scroll container. Always, including
  when the entry was already fully visible.
- This holds for every entry, including the first and the last ones in the list.
- Entries that show below the focused one after a jump are not marked read and do not take the focus because of
  that jump.

## Non-goals

- No change to mouse, touch or scrollbar scrolling. Entries that scroll into view by hand are still marked read
  and take the focus exactly as today.
- No change to entry layout or height. Short entries stay short.
- No smooth scrolling. The jump stays instant, as today.
- No new setting.

## Anti-goals

- J must never skip an entry or mark an entry read that the reader has not reached.
- Loading more entries must not start later than it does today.

## Approaches

1. **Pin to top, next entries visible below (chosen).** J/K always top-align. Entries below stay unread until
   reached. Blank space after the list lets the last entries reach the top. Manual scrolling is untouched.
2. **One entry per screen.** Give every entry a minimum height equal to the reading area. Simpler, and nothing
   shows below so nothing can be marked read by accident. Rejected: a feed of short entries becomes mostly blank
   space for anyone scrolling by mouse or on a phone.

Murray picked 1.

## Design

All paths are under `rss-temple-web-app/src/app/routes/main/`.

### 1. Always top-align (`components/shared/abstract-feeds/abstract-feeds.component.ts`)

`moveFocus` drops its `scrollToTopFn` parameter and the "only scroll if not fully visible" check. It always
scrolls the container to the existing `topAlignTop` value, clamped to 0 or more. `scrollToTopUp`,
`scrollToTopDown`, `bottomAlignTop` and `rectContainsRect` are removed if nothing else uses them. The J and K
handlers pass only the index function.

### 2. Room below the list (`components/feeds/feeds.component.html`, `components/feed/feed.component.html`)

Add an empty spacer element as the last child of the scroll container, after the footer, about as tall as the
scroll container. With it, the last entry can scroll to the top.

The spacer makes the container's `scrollHeight` larger, which would make the infinite-scroll directive fire
later. Compensate so that "load more" starts at the same scroll position as today (for example, raise
`appInfiniteScrollOffset` by the spacer's height). The exact mechanism is the builder's choice.

### 3. A jump does not mark the entries below as read

Today, 100ms after any scroll, every unread entry that intersects the viewport fires `onEntryEnteredViewport`,
which marks it read and gives it the focus. After a top-aligned jump, that would hit the entries showing below
the focused one, and the next J would skip them.

Fix (my call): after `moveFocus` scrolls, record the container's actual `scrollTop`. `onEntryEnteredViewport`
does nothing while the container's `scrollTop` still equals the recorded value. As soon as the reader scrolls
by hand, the values differ and today's behaviour returns. `reload()` clears the recorded value.

Known consequence, accepted: after a jump, the first manual scroll marks every unread entry then on screen as
read. That is what manual scrolling does today.

## Testing

- Unit tests in `feeds.component.spec.ts` (or `feed.component.spec.ts`): J/K scroll to the top-aligned position
  even when the entry is fully visible; `onEntryEnteredViewport` is ignored at the recorded `scrollTop` and
  honoured after it changes.
- Manual check in the browser against a local backend: short, tall, first and last entries; J then K; J then
  mouse scroll; infinite loading still triggers.
- Definition of done from `rss-temple-web-app/AGENTS.md`: tests, lint, template lint, prettier.

## Left to the builder

- Spacer markup and how its height is set.
- How the infinite-scroll trigger point is kept the same.
- Whether the `scrollTop` comparison needs a 1px tolerance.
