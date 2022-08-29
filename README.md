### How to run
`python -m SimpleHTTPServer 8000`

the note recognition action is in notes.html

the music.html is simply doing a basic demo of how to play the notes. 

So what I need to do for the final display
1. split out into two different canvases (for display and for recognition)
2. start saving out actual samples to disk, save model
3. not really sure how you properly test something like this in the wild. what i want to do is basically to record a bunch of strokes with their intended labels, and then verify it works as a baseline. Would need to keep these out of the training set of course