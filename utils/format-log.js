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
 * @param {number?} maxColumns
 * @returns {string[]}
 */
function formatLogLines(lines, filters, maxColumns) {
  if (lines.length === 0) return [];

  const lineParts = lines.map(l => l.split(SEPARATOR));
  const filteredParts = lineParts.filter(parts => filters.every(filter => matchesFilter(parts, filter)))

  if (filteredParts.length === 0) return [];

  const limitedParts = maxColumns
    ? filteredParts.map(parts => parts.slice(0, maxColumns))
    : filteredParts;

  const widths = calculateColumnWidths(limitedParts);

  const header = widths.map((width, i) => String(i).padStart(width))
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
 *   ./format-log.js file.log --max-columns 5          (only display first 6 columns)
 */
const args = process.argv.slice(2);
let filePath = null;
let inPlace = false;
/** @type {string[]} */
let filters = [];
let maxColumns = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--in-place' || arg === '-i') {
    inPlace = true;
  } else if (arg === '--filter' || arg === '-f') {
    filters.push(args[++i]);
  } else if (arg === '--max-columns' || arg === '-c') {
    maxColumns = parseInt(args[++i], 10) + 1;
  } else if (!arg.startsWith('--')) {
    filePath = arg;
  }
}

if (filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const formatted = formatLogLines(lines, filters, maxColumns);

  if (inPlace) {
    fs.writeFileSync(filePath, formatted.join('\n') + '\n');
    console.error(`Formatted ${filePath} in place`);
  } else {
    console.log(formatted.join('\n'));
  }
} else {
  let input = '';
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', chunk => {
    input += chunk;
  });

  process.stdin.on('end', () => {
    const lines = input.trim().split('\n');
    const formatted = formatLogLines(lines, filters, maxColumns);
    console.log(formatted.join('\n'));
  });
}
