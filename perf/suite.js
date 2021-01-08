const bowtie = require('..');
const stylis = require('stylis');

const input = `
  color:black;

  div {
    h2 {
      color:red;
      h3 {
        color:blue;
      }
    }
  }

  background: red;

  .foo & {
    width:1px;
    &:hover {
      color:black;
    }
    li {
      color:white;
    }
  }
`;

suite('Parse', () => {
  benchmark('bowtie', () => {
    bowtie.parse(input);
  });

  benchmark('stylis', () => {
    stylis.compile(input);
  });
});
