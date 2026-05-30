---
title: Monty Hall Plays Guess Who (badly)
draft: false
tags:
  - ramble
  - stats
description:
created: 2026-01-08
modified:
holiday:
---
# Disclaimer
Now that it is not past midnight, and although I may still be feverish, I will note that there is a substantial mathematical flaw to this post, and that the conclusions drawn are incorrect.

Specifically, step four argues that because there's an equal chance of guessing half the alternate region as there is guessing the originally guessed region that chance is 50%. In fact, best case scenario, that chance is 1/3 because of the other half of the alternate region.
# OG intro
As I lay on the couch, feeling somewhat ill, I scrolled through my YouTube feed and found [this video](https://youtu.be/_3RNB8eOSx0?si=XaYNiNW6siZfn5kw). I haven't finished it yet, but it got me thinking:

What it there's a more efficient guess method in Guess Who that revolves around using the Monty Hall problem framing yourself as both the host and the guesser?

First, context:
# What is the Monty Hall Problem?
From Wikipedia:

> Suppose you're on a game show, and you're given the choice of three doors: Behind one door is a car; behind the others, goats. You pick a door, say No. 1, and the host, who knows what's behind the doors, opens another door, say No. 3, which has a goat. He then says to you, "Do you want to pick door No. 2?" Is it to your advantage to switch your choice?
>
> The contestant should switch to the other door. By the standard assumptions, the switching strategy has a ⁠2/3⁠ probability of winning the car, while the strategy of keeping the initial choice has only a ⁠1/3⁠ probability.

This is somewhat strange but the math holds up.
# Apply it to Guess Who?
This is where the thoughts and the suppressed fever may be combining, and I am fairly certain that either:

a) the assumptions I'm about to make don't hold up
b) even if the assumptions I'm making are correct, the math still doesn't support them

but bear with me.

Here's your strategy:

1. Divide your characters evenly into thirds
This is probably easier with some boards than others, in a standard game, this'll be eight characters

2. Arbitrarily select one of those thirds
This is the contestants game show selection. It doesn't matter which third you choose

3. Guess one of those thirds
If you're correct, congrats, you're already ahead of someone using binary guessing, if you're wrong, move on to step four

4. Guess the section that you didn't arbitrarily select in step two
But wait, this leaves us with 1/3 confirmed rather than the 1/4 that we'd have established if we had just used binary guessing.

You're correct, let's roll that back

4. (again) Guess 1/2 of the section that you didn't arbitrarily select in step two
If the Monty Hall Problem has held up[^1], you're just as likely to be correct guessing that 1/6 of the set as you are guessing the 1/3 that you chose at the beginning of the game. 

5. Continue to binary guess the rest of the game
There aren't enough options to make such a spree profitable twice[^2]
# Does it work?
No, but it's interesting.

Bearing in mind that I still need to be correct about the way the Monty Hall problem functions, this strategy is both objectively worse than binary guessing and equivalent kinda sorta maybe?

First, the table with raw probabilities expressed in available board space:

| turn | binary | monty 1 | monty 2 | monty 3 | Average |
|------|--------|---------|---------|---------|---------|
| 1    | 50.00% | 33.33%  | 66.67%  | 66.67%  | 55.56%  |
| 2    | 25.00% | 16.67%  | 16.67%  | 50.00%  | 27.78%  |
| 3    | 12.50% | 8.33%   | 8.33%   | 25.00%  | 13.89%  |
| 4    | 6.25%  | 4.17%   | 4.17%   | 12.50%  | 6.94%   |
| 5    | 3.13%  | 2.08%   | 2.08%   | 6.25%   | 3.47%   |
Monty 1 represents getting lucky on the 1/3 chance guess, Monty 2 is getting a hit on the 50% guess of 1/6 of the board, Monty 3 is when the strategy is a total failure, and the average is of all three probabilities.

As you can see, the percentage of board possible covered is slightly higher in the Monty Hall strategy even though 2/3 of the time you come out ahead. But here's the thing, Guess Who has 24 characters, and so when you translate that into the table by multiplying by 24, you get this:

| turn | binary  | monty 1 | monty 2 | monty 3 | Average |
| ---- | ------- | ------- | ------- | ------- | ------- |
| 1    | 12      | 8       | 16      | 16      | 13.33   |
| 2    | 6       | 4       | 4       | 12      | 6.67    |
| 3    | 3       | 2       | 2       | 6       | 3.33    |
| 4    | ==1.5== | 1       | 1       | 3       | 1.67    |
| 5    | 0.75    | 0.5     | 0.5     | 1.5     | 0.83    |
But wait, you may be saying, how do you have one and a half characters remaining?

That's a great question, let's think about it.

That's right, you can't. What that means is that you've got to guess, and your guess, if I reckon correctly, has a 2/3 chance of leading you to only knock down one character, so let's think of binary guessing as having two options:

| turn | binary unlucky | binary lucky |
|------|----------------|--------------|
| 1    | 12             | 12           |
| 2    | 6              | 6            |
| 3    | 3              | 3            |
| 4    | 2              | 1            |
| 5    | 1              | 0            |
and when we assess a weighted average based on the probabilities of those outcomes (1/3 lucky, 2/3 unlucky), we can compare the averages by turn for the two strategies:

| turn | binary | monty |
|------|--------|-------|
| 1    | 12.00  | 13.33 |
| 2    | 6.00   | 6.67  |
| 3    | 3.00   | 3.33  |
| 4    | 1.67   | 1.67  |
| 5    | 0.67   | 0.83  |
What we find is somewhat fascinating. Although the Monty Hall guessing remains less efficient as a general method, on step four, and exclusively step four, the average remaining board space is the same.

The moral of the story: binary guessing still beats Monty Hall, but on boards with number of steps divisible by 3, it only barely misses the mark.

Stay tuned for next time when I examine whether you should use the Monty Hall strategy to choose between the final three options (the answer may surprise you, but will especially if you are a stickler to the rules of Guess Who[^3]).

[^1]: Which is a big if, I'm somewhat sure that I've done something wrong here, but I'm writing this for posterity so someone can eventually tell me what

[^2]: I'd need to check that to make sure

[^3]: Basically, the only place where it might be applicable is a version of the game where you both need to guess the correct person specifically by name, and where you are allowed to make specific guesses that, if correct, are that final guess, and if not, are simply further guesses.
