# RicochetRobots
A one dimensional game for 1- multiple plays.
There is a grid with randomly placed walls/ barriers. 
There are target spots, with a uquine color and design. 
There is a set of robots with different colors. 
A token matching one of the target spots on the grid is revealed.
The Goal: Find the shortest path to get the robot of the same color as the token to the target spot.
With multiple players: Be the first to find the shortest path to get the robot to the target spot.
A player that finds the path calls out the number of steps the robot takes to get to the target spot.
A one minute timer starts and other players have one minute to find a shorter path.
Restrictions:
  Determining the path must be done visually. No hands on the board until the player with the short path bid can show the path.
  Robots can only move up, down, left, right.
  The robots must hit a wall to stop moving. 
  
# Plan of Action
Start with just one robot and one target spot on a simple grid.
Use a game tree. 
The startingNode of a tree will be a state of the grid with the robot.
The childernNode will be possible states of the grid in one move.
The short path will be a breadthFristSearch to the leaf where the robot has reached the target spot.

# Starting
