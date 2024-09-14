/// <reference types="react-scripts" />

// global.d.ts or styles.d.ts
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
