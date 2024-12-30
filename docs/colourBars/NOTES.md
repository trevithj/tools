# Colour-Bar tool
Tool for creating a series of colour bars, with variable graduations of colour.

Extrapolation between colours, plus see how good we are at telling similar colours apart.

## IOs
1. I don't know how to extrapolate between two arbitrary colours.
2. How do I use JS to set the colour style of an element anyway?
3. How do I convert between hex and decimal?
4. I don't have a UI design yet.

## Task list
[x] 1. Check Perplexity for extrapolation. Write a test?
[x] 2. Consult MDN and document summary.
[x] 3. Write a test, then figure it out.
[x] 4. Mock-up an index page with basic controls.

## Tweaks and Issues:
### The colour bars show an undesired gradient effect.
Trials:
1. Replacing divs with SVG elements.
2. Trialled using linear-gradient with same colour start and end.
3. Trialled one big div with stepped linear-gradients.

Above resulted in the same effect.
The solution seems to be to use one SVG element, with coloured rect elements.
The single element doesn't seem to show the gradient effect, and gives the desired colour-bar range.

## Task list 2
[x] Extract a function to calculate an array of colour-codes.
[ ] Style up a fixed-height SVG to show the text (index, colour code)
[x] Style up a matching SVG to show the colour bars on the same y-scale
[ ] Align the 2 SVGs so index and code match the bars.

Actually, after mocking up the SVG, I got the same effect. So earlier result was bogus.
Either this is just due to my monitor/browser combination, or my eyes are lying to me!
