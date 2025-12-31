#!/usr/bin/env node

import fs from 'fs';

const SEPARATOR = '|';

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
    // Column-specific filter (e.g., "3:magical")
    const columnIndex = parseInt(filter.substring(0, colonIndex), 10);
    const searchTerm = filter.substring(colonIndex + 1).toLowerCase();

    if (columnIndex >= 0 && columnIndex < parts.length) {
      return parts[columnIndex].toLowerCase().includes(searchTerm);
    }
    return false;
  } else {
    // Search across all columns
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
      // Range syntax (e.g., "3:", ":4", "2:5")
      const [start, end] = part.split(':');
      const startIdx = start === '' ? 0 : parseInt(start, 10);
      const endIdx = end === '' ? maxCols - 1 : parseInt(end, 10);

      for (let i = startIdx; i <= endIdx && i < maxCols; i++) {
        indices.add(i);
      }
    } else {
      // Single column (e.g., "3", "7")
      const idx = parseInt(part, 10);
      if (idx < maxCols) {
        indices.add(idx);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Calculates the maximum width needed for each column across all rows.
 * @param {string[][]} lineParts - Array of rows, each row is an array of column values
 * @returns {number[]} Array of maximum widths per column
 */
function calculateColumnWidths(lineParts) {
  const maxColumns = Math.max(...lineParts.map(l => l.length));
  const widths = Array(maxColumns).fill(0);

  for (const parts of lineParts) {
    for (let i = 0; i < parts.length; i++) {
      const trimmed = parts[i].trim();
      widths[i] = Math.max(widths[i], trimmed.length);
    }
  }

  // Also consider header width (column index)
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
function formatLogLines(lines, filters, columnSyntax) {
  if (lines.length === 0) return [];

  const lineParts = lines.map(l => l.split(SEPARATOR));
  const filteredParts = lineParts.filter(parts => filters.every(filter => matchesFilter(parts, filter)))

  if (filteredParts.length === 0) return [];

  let limitedParts;
  const maxCols = Math.max(...filteredParts.map(p => p.length));
  if (columnSyntax.length != 0) {
    const columnIndices = parseColumnSyntax(columnSyntax, maxCols);
    limitedParts = filteredParts.map(parts =>
      columnIndices.map(i => parts[i] || '')
    );
  } else {
    limitedParts = filteredParts;
  }

  const widths = calculateColumnWidths(limitedParts);

  const originalIndices = columnSyntax.length > 0
    ? parseColumnSyntax(columnSyntax, maxCols)
    : Array.from({ length: widths.length }, (_, i) => i);

  const header = widths.map((width, i) => String(originalIndices[i]).padStart(width))
    .join(SEPARATOR);

  const formattedLines = limitedParts.map(parts => formatLogLine(parts, widths));

  return [header, ...formattedLines];
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
 */
const args = process.argv.slice(2);
let filePath = null;
let inPlace = false;
/** @type {string[]} */
let filters = [];
/** @type {string[]} */
let columnSyntax = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--in-place' || arg === '-i') {
    inPlace = true;
  } else if (arg === '--filter' || arg === '-f') {
    filters.push(args[++i]);
  } else if (arg === '--columns' || arg === '-c') {
    columnSyntax = columnSyntax.concat(args[++i].split(',').map(s => s.trim()));
  } else if (!arg.startsWith('--')) {
    filePath = arg;
  }
}

if (filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const formatted = formatLogLines(lines, filters, columnSyntax);

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
    const formatted = formatLogLines(lines, filters, columnSyntax);
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
