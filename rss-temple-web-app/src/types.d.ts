declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: Uint8Array;
  export default content;
}

declare module '*.wav' {
  const content: Uint8Array;
  export default content;
}
