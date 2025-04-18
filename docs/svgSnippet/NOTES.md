# SVG Snippet tool

A tool for creating an SVG to represent a formatted code-snippet.

## Input
- Raw block of text for formatting
- Categories of token, with matching colr
- List of tokens for each category

## Process
- For each line of text, figure out indent/position
- Wrap any tokens with a format element to display colour
- Create a <text> element to represent the row

## Output
- Create an SVG with embedded styling
- Add the text elements
- Display the SVG
- Allow downloading / editing of dimensions?
