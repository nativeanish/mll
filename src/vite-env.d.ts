/// <reference types="vite/client" />
/// <reference types="arconnect" />

// Allow importing arbitrary files as raw strings via Vite query suffix
declare module "*?raw" {
  const content: string;
  export default content;
}
