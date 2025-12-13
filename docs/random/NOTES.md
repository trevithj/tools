# Random: a random sequence generator tool

## Version 1
Plan for the UI (version 1) is:
* user enters a seed number for the pseudo-random generator.
* user also selects how many characters in the sequence.
* and user selects which character set to use for the sequence (alpha-numeric, digits only, mixed-case, special characters etc)
* User requests generation

The output will be a list of (maybe) 10 generated sequences, and perhaps also an indication of their strengths. For example, if a sequence lacks special characters, or not enough upper-case letters etc. Whatever is appropriate for the character set.

The user can easily copy any of the sequences.

The idea is that I can note only the seed, length, charset and list number. Some or all of these values should be easier to remember. This allows me to regenerate an existing password any time I need to should I forget. Even if noted down, it is very unlikely the above info will be meaningful to anyone else. At least, that is the plan.

## Version 2
Plan for the UI is:
* user enters a seed number for the pseudo-random generator.
* user also selects how many characters in each sub-sequence (see below).
* User requests generation

The output will be a list of generated sub-sequences, each one using a pre-defined character set: digits; lower-case letters; upper-case letters; special characters. The idea being we can guarantee the full sequence will have x number of special characters, y number of upper-case letters, etc.

Probably we should generate more than one sub-sequence for each character set.

Each sub-sequence has an Append button opposite it. When the user clicks this, the sequence gets copied/appended into the output field, allowing the user to build up a longer sequence.

This way I only need note the seed, length, and indices of the sub-sequences used.

## Version 3
Plan is to add another field that allows the user to enter any arbitrary string. The app generates an integer hash, which gets used as the seed value.
