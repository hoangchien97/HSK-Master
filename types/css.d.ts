declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'tippy.js/dist/tippy.css';
declare module '@/styles/tippy-custom.css';
