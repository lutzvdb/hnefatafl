## hnefatafl

This is a modern implementation of the ancient game of hnefatafl. You can see it live and in action here: https://www.hnefatafl.app . It is written using nextjs. The game logic is expressed as a set of TS functions and the rendering takes place only using HTML and CSS.

It includes a rudimentary AI as well as a multiplayer mode using MongoDB.

If you'd like to contribute, feel free to reach out. Current open points include:
 - Validation of ther ruleset with someone more involved with the game itself 
 - Building a better AI - currently, it's severly limited by the lookahead as it does a simple search. I'd love to train an agent-based model, or at least improve upon the current search-based algorithm.
 - A recoded game core that more efficiently can determine legality of moves and beating to improve AI speed
 - "I'm still here"-push to database to reaffirm that the host is still looking (update latestActive)