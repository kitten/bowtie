/**
 * This is a spec-compliant implementation of a CSS 2.1+ Grammar, with some
 * alterations made as needed for CSS 3 or simplifications that increase looseness.
 * See: https://www.w3.org/TR/CSS21/grammar.html
 */
import { match, interpolation, parse as makeParser } from 'reghex';

// Includes any whitespace, multiline comments, and line comments
const ignore = /(?:\s+|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|\/\/[^\n\r]*)+/g;
// Any number including sign, decimals, and exponents
const number = /[+-]?(?:\d*[.])?\d+(?:[eE][+-]?\d+)?/g;
// Valid identifiers are words including hyphens and underscores
const identifier = /-{0,2}[\w_][\w\d_-]*/g;
// Valid units that may follow a number
const unit = /%|\w+/g;
// Valid element selectors targeting classes, IDs, elements, and self/star selectors
const simple_selector = /[&*]|[#.]?[_\w][_-\w\d]*/g;
// A string is bound by quotes, which may escape quotes and newlines
const string = /"(?:[^\n"]|\\.)*"|'(?:[^\n']|\\.)*'/g;

const extTag = tag => x =>
  !!x && (typeof x === 'string' || typeof x === 'function' || x.tag === tag) && x;

const ext_css = match('ext_css')`
  ${interpolation(extTag('set'))}
  (?: ${/;/} ${ignore}?)*
`;

const ext_property = match('ext_property')`
  ${interpolation(extTag('id'))}
  (?: ${ignore}?)
`;

const ext_value = match('ext_value')`
  ${interpolation(extTag('expr'))}
  (?: ${ignore}?)
`;

const ext_selector = match('ext_selector')`
  ${interpolation(extTag('selector'))}
  (?: ${ignore}?)
`;

const ext_at = match('ext_at')`
  ${interpolation(extTag('at_expr'))}
`;

// A hex color with 3-8 digits (loose definition)
const hex = match('hex')`
  ${/#[0-9a-fA-F]{3,8}/}
  (?: ${ignore}?)
`;

const id = match('id')`
  ${identifier}
  (?: ${ignore}?)
`;

const important = match('important')`
  (?: ${/!/} ${ignore}? ${/important/} ${ignore}?)
`;

const func = match('func')`
  ${identifier}
  (?: ${/\(/} ${ignore}?)
  ${value}
  (?: ${/\)/} ${ignore}?)
`;

const pseudo_args = match('pseudo_args')`
  (?: ${/\(/} ${ignore}?)
  ${selector}?
  (?: ${ignore}? ${/\)/})
`;

const pseudo = match('pseudo')`
  (?: ${/::?/})
  ${identifier}
  ${pseudo_args}?
`;

const attrib = match('attrib')`
  (?: ${/\[/} ${ignore}?)
  ${identifier}
  (?: ${ignore}?)
  ${/[~|^$*]?=/}
  (?: ${ignore}?)
  ${string}
  (?: ${ignore}?)
  ${/[iIsS]/}?
  (?: ${ignore}? ${/\]/} ${ignore}?)
`;

const selector_term = match('selector_term')`
  (${ext_selector} | ${simple_selector} | ${attrib} | ${pseudo})
  (${ext_selector} | ${simple_selector} | ${attrib} | ${pseudo})*
  (?: ${ignore}?)
`;

const combinator = match('combinator')`
  ${/[>+~]/} (?: ${ignore}?)
`;

const selector = match('selector')`
  (${combinator}? ${selector_term})
  (${combinator}? ${selector_term})*
  (?: ${ignore}?)
`;

const value = match('value')`
  (${number} ${unit}? | ${string})
  (?: ${ignore}?)
`;

const value_term = match('term')`
  ${ext_value} |
  ${func} |
  ${id} |
  ${hex} |
  ${value}
`;

const operator = match('operator')`
  ${/[/,*+-]/} (?: ${ignore}?)
`;

const value_expr = match('expr')`
  ${value_term}
  (${operator}? ${value_term})*
`;

const declaration = match('declaration')`
  (${id} | ${ext_property})
  (?: ${/:/} ${ignore}?)
  ${value_expr}
  ${important}?
`;

const at_term = match('at_term')`
  ${ext_at} |
  ${id} |
  (?: ${/\(/} ${ignore}?)
  ${declaration}
  (?: ${/\)/} ${ignore}?)
`;

const at_expr = match('at_expr')`
  ${at_term}
  (
    (?: ${/,/} ${ignore}?) |
    ${at_term}
  )*
`;

const at_rule = match('at_rule')`
  (?: ${/@/}) ${identifier}
  (?: ${ignore}?)
  ${at_expr}?
`;

const rule = match('rule')`
  (?= ${/[^;}]+{/})
  (${at_rule} | ${selector})
  (?: ${/{/} ${ignore}?)
  ${set}
  (?: ${/}/} ${ignore}?)
`;

const recover = match('recover')`
  ${/[^;}]+;?/} (?: ${ignore}?)
`;

const set = match('set')`
  (
    ${rule} |
    ${ext_css} |
    ${declaration} (?: ${/;/} ${ignore}?)* |
    ${recover}
  )*
`;

export const parse = makeParser(set);
