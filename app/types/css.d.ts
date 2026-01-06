declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'tippy.js/dist/tippy.css';
declare module '@/app/styles/tippy-custom.css';
