/**
 * This is a spec-compliant implementation of a CSS 2.1+ Grammar, with some
 * alterations made as needed for CSS 3 or simplifications that increase looseness.
 * See: https://www.w3.org/TR/CSS21/grammar.html
 */
import { match, interpolation, parse as makeParser } from 'reghex';

// Used to ignore any whitespaces, multiline comments, and line comments
const _ = /(?:\s+|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|\/\/[^\n\r]*)*/g;

// Any number including sign, decimals, and exponents
const number = /[+-]?(?:\d*[.])?\d+(?:[eE][+-]?\d+)?/g;
// Valid identifiers are words including hyphens and underscores
const identifier = /-{0,2}[\w_][\w\d_-]*/g;
// Valid units that may follow a number
const unit = /%|\w+/g;
// A hex color with 3-8 digits (loose definition)
const hexcolor = /#[0-9a-fA-F]{3,8}/g;
// Valid element selectors targeting classes, IDs, elements, and self/star selectors
const simple_selector = /[&*]|[#.]?[_\w][_-\w\d]*/g;
// A string is bound by quotes, which may escape quotes and newlines
const string = /"(?:[^\n"]|\\.)*"|'(?:[^\n']|\\.)*'/g;

const extTag = tag => x =>
  !!x && (typeof x === 'string' || typeof x === 'function' || x.tag === tag) && x;

const ext_css = match('ext_css')`
  ${interpolation(extTag('set'))}
  (?: ${';'} ${_})*
`;

const ext_property = match('ext_property')`
  ${interpolation(extTag('id'))}
  :${_}
`;

const ext_value = match('ext_value')`
  ${interpolation(extTag('expr'))}
  :${_}
`;

const ext_selector = match('ext_selector')`
  ${interpolation(extTag('selector'))}
  :${_}
`;

const ext_at = match('ext_at')`
  ${interpolation(extTag('at_expr'))}
`;

const id = match('id')`
  ${identifier}
  :${_}
`;

const important = match('important')`
  (?: ${'!'} ${_} ${/important/} ${_})
`;

const func = match('func')`
  ${identifier}
  (?: ${'('} ${_})
  ${value}
  (?: ${')'} ${_})
`;

const pseudo_args = match('pseudo_args')`
  (?: ${'('} ${_})
  ${selector}?
  (?: ${_} ${')'})
`;

const pseudo = match('pseudo')`
  (?: ${/::?/})
  ${identifier}
  ${pseudo_args}?
`;

const attrib = match('attrib')`
  (?: ${'['} ${_})
  ${identifier}
  :${_}
  ${/[~|^$*]?=/}
  :${_}
  ${string}
  :${_}
  ${/[iIsS]/}?
  (?: ${_} ${']'} ${_})
`;

const selector_term = match('selector_term')`
  (${ext_selector} | ${simple_selector} | ${attrib} | ${pseudo})
  (${ext_selector} | ${simple_selector} | ${attrib} | ${pseudo})*
  :${_}
`;

const combinator = match('combinator')`
  ${/[>+~]/} :${_}
`;

const selector = match('selector')`
  (${combinator}? ${selector_term})
  (${combinator}? ${selector_term})*
  :${_}
`;

const value = match('value')`
  (${number} ${unit}? | ${string} | ${hexcolor})
  :${_}
`;

const value_term = match('term')`
  ${ext_value} |
  ${func} |
  ${id} |
  ${value}
`;

const operator = match('operator')`
  ${/[/,*+-]/} :${_}
`;

const value_expr = match('expr')`
  ${value_term}
  (${operator}? ${value_term})*
`;

const declaration = match('declaration')`
  (${id} | ${ext_property})
  (?: ${':'} ${_})
  ${value_expr}
  ${important}?
`;

const at_term = match('at_term')`
  ${ext_at} |
  ${id} |
  (?: ${/\(/} ${_})
  ${declaration}
  (?: ${/\)/} ${_})
`;

const at_expr = match('at_expr')`
  ${at_term}
  (
    (${','} :${_}) |
    ${at_term}
  )*
`;

const at_rule = match('at_rule')`
  :${'@'} ${identifier}
  :${_}
  ${at_expr}?
`;

const rule = match('rule')`
  =${/[^;}]+{/}
  (${at_rule} | ${selector})
  (?: ${'{'} ${_})
  ${set}
  (?: ${'}'} ${_})
`;

const recover = match('recover')`
  ${/[^;}]+;?/} :${_}
`;

const set = match('set')`
  (
    ${rule} |
    ${ext_css} |
    ${declaration} (?: ${';'} ${_})* |
    ${recover}
  )*
`;

export const parse = makeParser(set);
