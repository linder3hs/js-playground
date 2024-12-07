export const customPrismStyles = `
  code[class*="language-"],
  pre[class*="language-"] {
    color: #fff;
    background: none;
    text-shadow: none;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
  }

  pre[class*="language-"],
  :not(pre) > code[class*="language-"] {
    background: transparent !important;
    border: none;
    padding: 0;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6a737d;
  }

  .token.punctuation {
    color: #7c8590;
  }

  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol {
    color: #79c0ff;
  }

  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin {
    color: #a5d6ff;
  }

  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .token.variable,
  .token.inserted {
    color: #a5d6ff;
    background: transparent;
  }

  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: #ff7b72;
  }

  .token.regex,
  .token.important {
    color: #a5d6ff;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  .token.deleted {
    color: #ff7b72;
  }
`;
