declare module '*.less' {
  const Styles: {
    [ key: string ]: string
  };
  export default Styles;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
