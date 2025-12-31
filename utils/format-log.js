#!/usr/bin/env node

import fs from 'fs';

/** @type {string[]} */
let filters = [];
/** @type {string[]} */
let columnSyntax = [];
let showLineNumbers = false;
let contextBefore = 0;
let contextAfter = 0;

const SEPARATOR = '|';

const COLORS = {
  dim: process.stdout.isTTY ? '\x1b[2m' : '',
  cyan: process.stdout.isTTY ? '\x1b[36m' : '',
  reset: process.stdout.isTTY ? '\x1b[0m' : '',
};

/**
 * @typedef {Object} LineParts
 * @property {number} lineNumber
 * @property {string[]} parts
 */

/**
 * @param {string} value
 * @param {number} width
 * @returns {string}
 */
function formatValue(value, width) {
  const trimmed = value.trim();
  if (isNaN(trimmed))
    return trimmed.padEnd(width);
  return trimmed.padStart(width);
}

/**
 * @param {string[]} parts
 * @param {number[]} widths
 * @returns {string}
 */
function formatLogLine(parts, widths) {
  return parts.map((part, i) => formatValue(part, widths[i]))
    .join(SEPARATOR);
}

/**
 * @param {string[]} parts
 * @param {string} filter - Filter string (e.g., "magical" or "3:magical")
 * @returns {boolean} if the line matches the filter
 */
function matchesFilter(parts, filter) {
  if (!filter) return true;

  const colonIndex = filter.indexOf(':');

  if (colonIndex > 0) {
    // e.g., "3:magical"
    const columnIndex = parseInt(filter.substring(0, colonIndex), 10);
    const searchTerm = filter.substring(colonIndex + 1).toLowerCase();

    if (columnIndex >= 0 && columnIndex < parts.length) {
      return parts[columnIndex].toLowerCase().includes(searchTerm);
    }
    return false;
  } else {
    const searchTerm = filter.toLowerCase();
    return parts.some(part => part.toLowerCase().includes(searchTerm));
  }
}

/**
 * @param {string[]} syntax e.g., ["15"], [":4"], ["3:"], ["3","4","7"], [":3","8","10"]
 * @param {number} maxCols
 * @returns {number[]} indices to include
 */
function parseColumnSyntax(syntax, maxCols) {
  const indices = new Set();

  for (const part of syntax) {
    if (part.includes(':')) {
      // e.g., "3:", ":4", "2:5"
      const [start, end] = part.split(':');
      const startIdx = start === '' ? 0 : parseInt(start, 10);
      const endIdx = end === '' ? maxCols - 1 : parseInt(end, 10);

      for (let i = startIdx; i <= endIdx && i < maxCols; i++) {
        indices.add(i);
      }
    } else {
      // e.g., "3", "7"
      const idx = parseInt(part, 10);
      if (idx < maxCols) {
        indices.add(idx);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * @param {LineParts[]} lineParts
 * @returns {number[]} Array of maximum widths per column
 */
function calculateColumnWidths(lineParts) {
  const MIN_COLUMN_WIDTH = 3;
  const maxColumns = Math.max(...lineParts.map(({ parts }) => parts.length));
  const widths = Array(maxColumns).fill(MIN_COLUMN_WIDTH);

  for (const { parts } of lineParts) {
    for (let i = 0; i < parts.length; i++) {
      const trimmed = parts[i].trim();
      widths[i] = Math.max(widths[i], trimmed.length);
    }
  }

  for (let i = 0; i < maxColumns; i++) {
    widths[i] = Math.max(widths[i], String(i).length);
  }

  return widths;
}

/**
 * @param {string[]} lines
 * @param {string[]} filters
 * @param {string[]} columnSyntax
 * @returns {string[]}
 */
function formatLogLines(lines) {
  if (lines.length === 0) return [];

  const lineParts = lines.map(l => l.split(SEPARATOR));

  /** @type {number[]} */
  const matchingIndices = [];
  lineParts.forEach((parts, idx) => {
    if (filters.every(filter => matchesFilter(parts, filter))) {
      matchingIndices.push(idx);
    }
  });

  if (matchingIndices.size === 0) return [];

  /** @type {LineParts[]} */
  let matchingParts = matchingIndices
    .map(idx => ({ lineNumber: idx, parts: lineParts[idx] }));

  const maxCols = Math.max(...matchingParts.map(({ parts }) => parts.length));

  /** @type {number[]} */
  let columnIndices;
  /** @type {number[]} */
  let widths
  if (columnSyntax.length > 0) {
    columnIndices = parseColumnSyntax(columnSyntax, maxCols)
    matchingParts = matchingParts.map(({ lineNumber, parts }) =>
      ({ lineNumber, parts: columnIndices.map(i => parts[i] || '') })
    );
    widths = calculateColumnWidths(matchingParts);
  } else {
    widths = calculateColumnWidths(matchingParts);
    columnIndices = Array.from({ length: widths.length }, (_, i) => i);
  }

  const lineNumWidth = showLineNumbers ? String(Math.max(...matchingIndices)).length : 0;

  const header = (showLineNumbers ? '#'.padStart(lineNumWidth) + SEPARATOR : '') +
    widths.map((width, i) => String(columnIndices[i]).padStart(width))
      .join(SEPARATOR);

  const result = [header];

  for (const { lineNumber, parts } of matchingParts) {
    const lineNum = showLineNumbers ? String(lineNumber).padStart(lineNumWidth) : '';

    const before = Math.max(0, lineNumber - contextBefore);
    for (let contextId = before; contextId < lineNumber; contextId++) {
      result.push(`${COLORS.dim}-> ${COLORS.cyan}${contextId}${COLORS.reset} ${lines[contextId]}${COLORS.reset}`);
    }

    const formatted = formatLogLine(parts, widths);
    result.push((showLineNumbers ? lineNum + SEPARATOR : '') + formatted);


    const after = Math.min(lines.length, lineNumber + contextAfter);
    for (let contextId = lineNumber + 1; contextId <= after; contextId++) {
      result.push(`${COLORS.dim}-> ${COLORS.cyan}${contextId}${COLORS.reset} ${lines[contextId]}${COLORS.reset}`);
    }
  }

  return result;
}

/**
 * Usage:
 *   cat file.log | ./format-log.js
 *   ./format-log.js file.log                          (outputs to stdout)
 *   ./format-log.js file.log --in-place               (modifies file)
 *   ./format-log.js file.log --filter magical         (filter any column containing "magical")
 *   ./format-log.js file.log --filter 3:magical       (filter column 3 containing "magical")
 *   ./format-log.js file.log --columns 2 --columns 3  (columns 2 and 3)
 *   ./format-log.js file.log --columns :4             (columns 0 through 4)
 *   ./format-log.js file.log --columns 3:             (columns 3 onwards)
 *   ./format-log.js file.log -A 2                     (show 2 lines after each match)
 *   ./format-log.js file.log -B 3                     (show 3 lines before each match)
 *   ./format-log.js file.log --context 2              (show 2 lines before and after each match)
 */
const args = process.argv.slice(2);
let filePath = null;
let inPlace = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--in-place' || arg === '-i') {
    inPlace = true;
  } else if (arg === '--filter' || arg === '-f') {
    filters.push(args[++i]);
  } else if (arg === '--columns' || arg === '-c') {
    columnSyntax = columnSyntax.concat(args[++i].split(',').map(s => s.trim()));
  } else if (arg === '-A') {
    contextAfter = parseInt(args[++i], 10);
  } else if (arg === '-B') {
    contextBefore = parseInt(args[++i], 10);
  } else if (arg === '--context' || arg === '-C') {
    const context = parseInt(args[++i], 10);
    contextBefore = context;
    contextAfter = context;
  } else if (!arg.startsWith('--') && !arg.startsWith('-')) {
    filePath = arg;
  }
}
showLineNumbers = !inPlace;

if (filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const formatted = formatLogLines(lines);

  if (inPlace) {
    fs.writeFileSync(filePath, formatted.join('\n') + '\n');
    console.error(`Formatted ${filePath} in place`);
  } else {
    console.log(formatted.join('\n'));
  }
} else {
  let input = '';
  process.stdin.setEncoding('utf-8');

  function output() {
    const lines = input.trim().split('\n');
    const formatted = formatLogLines(lines);
    console.log(formatted.join('\n'));
    input = '';
  }
  process.stdin.on('data', chunk => {
    if (chunk === '\n') {
      output();
    } else {
      input += chunk;
    }
  });

  process.stdin.on('end', output);
}