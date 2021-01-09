export const stringify = x => {
  if (typeof x === 'string') return x;

  let separator = '';
  switch (x.tag) {
    case 'expr':
    case 'selector':
    case 'at_expr':
      separator = ' ';
      break;
    case 'set':
      separator = ';\n';
      break;

    case 'ext_css':
    case 'ext_property':
    case 'ext_value':
    case 'ext_selector':
    case 'ext_at':
      return typeof x[0] !== 'function'
        ? stringify(x[0])
        : '/*ext*/';

    case 'id':
    case 'hex':
      return x[0];
    case 'important':
      return '!important';
    case 'pseudo_args':
      return `(${stringify(x)})`;
    case 'pseudo':
      return `:${x[0]}${stringify(x[1])}`;
    case 'attrib':
      return `[${x[0]}${x[1]}${x[2]}${x[3] || ''}]`;
    case 'func':
      return `${x[0]}(${stringify(x[1])})`;
    case 'at_declaration':
      return `(${stringify(x[0])})`;
    case 'declaration':
      return `${stringify(x[0])}: ${stringify(x[1])}`
        + (x[2] ? ` ${stringify(x[2])}` : '');
    case 'at_rule':
      return `@${x[0]} ` + (x[1] ? stringify(x[1]) + ' ' : '');
    case 'rule':
      return `${stringify(x[0])}{\n${stringify(x[1])}\n}`;
    case 'recover':
      return `/*${x[0]}*/`;
  }

  let output = '';
  for (let i = 0, l = x.length; i < l; i++) {
    if (i !== 0) output += separator;
    output += stringify(x[i]);
  }

  return output;
};
