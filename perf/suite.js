const bowtie = require('..');
const stylis = require('stylis');

const complex = `
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

const simple = `
  color: black;
  background: red;

  .foo & {
    width: 1px;
  }
`;

suite('Parse Complex', () => {
  benchmark('bowtie', () => {
    bowtie.parse(complex);
  });

  benchmark('stylis', () => {
    stylis.compile(complex);
  });
});

suite('Parse Simple', () => {
  benchmark('bowtie', () => {
    bowtie.parse(simple);
  });

  benchmark('stylis', () => {
    stylis.compile(simple);
  });
});
