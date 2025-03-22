const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

export function alterFeedEntryContent(content: string) {
  const doc = domParser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');
  images.forEach(img => {
    img.setAttribute('referrerpolicy', 'no-referrer');
  });
  return xmlSerializer.serializeToString(doc);
}
