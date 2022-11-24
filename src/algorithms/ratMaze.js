function isSafe(maze, x, y) {
  let N = maze.length;
  return x >= 0 && x < N && y >= 0 && y < N && !maze[x][y].isWall;
}
export function solveMaze(maze, START_ROW, START_COL, FINAL_ROW, FINAL_COL) {
  let N = maze.length;
  let sol = new Array(N);
  for (let i = 0; i < N; i++) {
    sol[i] = new Array(N);
    for (let j = 0; j < N; j++) {
      sol[i][j] = 0;
    }
  }

  if (
    solveMazeUtil(maze, START_ROW, START_COL, FINAL_ROW, FINAL_COL, sol) ==
    false
  ) {
    document.write("Solution doesn't exist");
    return false;
  }

  //   printSolution(sol);
  console.log("printing...");
  console.log(sol);
  return true;
}

function solveMazeUtil(maze, x, y, FINAL_ROW, FINAL_COL, sol) {
  if (x == FINAL_ROW - 1 && y == FINAL_COL - 1 && !maze[x][y].isWall) {
    sol[x][y] = 1;
    maze[x][y].isVisited = true;
    return true;
  }

  if (isSafe(maze, x, y) == true) {
    if (sol[x][y] == 1) return false;
    sol[x][y] = 1;
    maze[x][y].isVisited = true;
    console.log(maze[x][y]);

    if (solveMazeUtil(maze, x + 1, y, FINAL_ROW, FINAL_COL, sol)) return true;
    if (solveMazeUtil(maze, x, y + 1, FINAL_ROW, FINAL_COL, sol)) return true;
    if (solveMazeUtil(maze, x - 1, y, FINAL_ROW, FINAL_COL, sol)) return true;
    if (solveMazeUtil(maze, x, y - 1, FINAL_ROW, FINAL_COL, sol)) return true;
    sol[x][y] = 0;
    maze[x][y].isVisited = false;
    return false;
  }
  return false;
}
