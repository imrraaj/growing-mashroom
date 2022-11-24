import React, { Component, startTransition, useEffect, useState } from "react";
import Node from "./Node";
import { dijkstra } from "../algorithms/dijkstra";

import { bfs } from "../algorithms/bfs";
import { dfs } from "../algorithms/dfs";
import { solveMaze } from "../algorithms/ratMaze";

export default function Pathfinder() {
  const data = {
    grid: [],
    START_NODE_ROW: 5,
    FINISH_NODE_ROW: 18,
    START_NODE_COL: 5,
    FINISH_NODE_COL: 15,
    mouseIsPressed: false,
    ROW_COUNT: 40,
    COLUMN_COUNT: 40,
    MOBILE_ROW_COUNT: 10,
    MOBILE_COLUMN_COUNT: 20,
    isRunning: false,
    isStartNode: false,
    isFinishNode: false,
    isWallNode: false,
    currRow: 0,
    currCol: 0,
    isDesktopView: true,
  };
  const [state, setState] = useState(data);

  function createNode(row, col) {
    return {
      row,
      col,
      isStart: row === state.START_NODE_COL && col === state.START_NODE_COL,
      isFinish: row === state.FINISH_NODE_ROW && col === state.FINISH_NODE_COL,
      distance: Infinity,
      distanceToFinishNode:
        Math.abs(state.FINISH_NODE_ROW - row) +
        Math.abs(state.FINISH_NODE_COL - col),
      isVisited: false,
      isWall: false,
      previousNode: null,
      isNode: true,
    };
  }

  function toggleIsRunning() {
    setState({ ...state, isRunning: !state.isRunning });
  }

  function getInitialGrid(rowCount, colCount) {
    const initialGrid = [];
    for (let row = 0; row < rowCount; row++) {
      const currentRow = [];
      for (let col = 0; col < colCount; col++) {
        currentRow.push(createNode(row, col));
      }
      initialGrid.push(currentRow);
    }
    return initialGrid;
  }
  function isGridClear() {
    for (const row of state.grid) {
      for (const node of row) {
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (
          nodeClassName === "node node-visited" ||
          nodeClassName === "node node-shortest-path"
        ) {
          return false;
        }
      }
    }
    return true;
  }

  function handleMouseDown(row, col) {
    if (!state.isRunning) {
      if (isGridClear()) {
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          "node node-start"
        ) {
          setState({
            ...state,
            mouseIsPressed: true,
            isStartNode: true,
            currRow: row,
            currCol: col,
          });
        } else if (
          document.getElementById(`node-${row}-${col}`).className ===
          "node node-finish"
        ) {
          setState({
            ...state,
            mouseIsPressed: true,
            isFinishNode: true,
            currRow: row,
            currCol: col,
          });
        } else {
          const newGrid = getNewGridWithWallToggled(state.grid, row, col);
          setState({
            ...state,
            grid: newGrid,
            mouseIsPressed: true,
            isWallNode: true,
            currRow: row,
            currCol: col,
          });
        }
      } else {
        clearGrid();
      }
    }
  }

  function clearGrid() {
    const g = getInitialGrid(state.ROW_COUNT, state.COLUMN_COUNT);
    setState({ ...data, grid: g });
    for (const row of g) {
      for (const node of row) {
        let nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;

        if (nodeClassName === "node node-finish") {
          node.isVisited = false;
          node.distance = Infinity;
          node.distanceToFinishNode = 0;
        } else if (nodeClassName === "node node-start") {
          node.isVisited = false;
          node.distance = Infinity;
          node.distanceToFinishNode =
            Math.abs(state.FINISH_NODE_ROW - node.row) +
            Math.abs(state.FINISH_NODE_COL - node.col);
          node.isStart = true;
          node.isWall = false;
          node.previousNode = null;
          node.isNode = true;
        } else {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node";
        }
      }
    }
  }

  function clearWalls() {
    for (const row of state.grid) {
      for (const node of row) {
        let nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;

        if (nodeClassName === "node node-wall") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node";
          node.isWall = false;
        }
      }
    }
  }

  function visualize(algo) {
    if (!state.isRunning) {
      toggleIsRunning();
      const { grid } = state;
      const startNode = grid[state.START_NODE_ROW][state.START_NODE_COL];
      const finishNode = grid[state.FINISH_NODE_ROW][state.FINISH_NODE_COL];
      let visitedNodesInOrder;
      switch (algo) {
        case "Dijkstra":
          visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
          break;
        case "BFS":
          visitedNodesInOrder = bfs(grid, startNode, finishNode);
          break;
        case "DFS":
          visitedNodesInOrder = dfs(grid, startNode, finishNode);
          break;
        default:
          // should never get here
          break;
      }
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      nodesInShortestPathOrder.push("end");
      animate(visitedNodesInOrder, nodesInShortestPathOrder);
    }
  }

  function animate(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (
          nodeClassName !== "node node-start" &&
          nodeClassName !== "node node-finish"
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }
      }, 10 * i);
    }
  }

  function randomWalls() {
    if (!state.isRunning) {
      for (const row of state.grid) {
        for (const node of row) {
          let nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`
          ).className;
          const probability = Math.random();
          if (
            nodeClassName != "node node-start" &&
            nodeClassName != "node node-finish" &&
            probability < 0.2
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-wall";
            node.isWall = true;
          }
        }
      }
    }
  }
  /******************** Create path from start to finish ********************/
  function animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      if (nodesInShortestPathOrder[i] === "end") {
        setTimeout(() => {
          toggleIsRunning();
        }, i * 50);
      } else {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          const nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`
          ).className;
          if (
            nodeClassName !== "node node-start" &&
            nodeClassName !== "node node-finish"
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-shortest-path";
          }
        }, i * 40);
      }
    }
  }
  function handleMouseUp(row, col) {
    if (!state.isRunning) {
      setState({ ...state, mouseIsPressed: false });
      if (state.isStartNode) {
        const isStartNode = !state.isStartNode;
        setState({
          ...state,
          isStartNode,
          START_NODE_ROW: row,
          START_NODE_COL: col,
        });
      } else if (state.isFinishNode) {
        const isFinishNode = !state.isFinishNode;
        setState({
          ...state,
          isFinishNode,
          FINISH_NODE_ROW: row,
          FINISH_NODE_COL: col,
        });
      }
    }
  }

  function handleMouseEnter(row, col) {
    if (!state.isRunning) {
      if (state.mouseIsPressed) {
        const nodeClassName = document.getElementById(
          `node-${row}-${col}`
        ).className;
        if (state.isStartNode) {
          if (nodeClassName !== "node node-wall") {
            const prevStartNode = state.grid[state.currRow][state.currCol];
            prevStartNode.isStart = false;
            document.getElementById(
              `node-${state.currRow}-${state.currCol}`
            ).className = "node";

            setState({ ...state, currRow: row, currCol: col });
            const currStartNode = state.grid[row][col];
            currStartNode.isStart = true;
            console.log({ currStartNode });

            for (const row of state.grid) {
              for (const node of row) {
                let nodeClassName = document.getElementById(
                  `node-${node.row}-${node.col}`
                ).className;

                if (nodeClassName === "node node-start") {
                  document.getElementById(
                    `node-${node.row}-${node.col}`
                  ).className = "node";
                  node.isWall = false;
                }
              }
            }

            document.getElementById(`node-${row}-${col}`).className =
              "node node-start";
          }
          setState({ ...state, START_NODE_ROW: row, START_NODE_COL: col });
        } else if (state.isFinishNode) {
          if (nodeClassName !== "node node-wall") {
            const prevFinishNode = state.grid[state.currRow][state.currCol];
            prevFinishNode.isFinish = false;
            document.getElementById(
              `node-${state.currRow}-${state.currCol}`
            ).className = "node";

            setState({ ...state, currRow: row, currCol: col });
            const currFinishNode = state.grid[row][col];
            currFinishNode.isFinish = true;

            for (const row of state.grid) {
              for (const node of row) {
                let nodeClassName = document.getElementById(
                  `node-${node.row}-${node.col}`
                ).className;

                if (nodeClassName === "node node-finish") {
                  document.getElementById(
                    `node-${node.row}-${node.col}`
                  ).className = "node";
                  node.isWall = false;
                }
              }
            }
            document.getElementById(`node-${row}-${col}`).className =
              "node node-finish";
          }
          setState({ ...state, FINISH_NODE_ROW: row, FINISH_NODE_COL: col });
        } else if (state.isWallNode) {
          const newGrid = getNewGridWithWallToggled(state.grid, row, col);
          setState({ ...state, grid: newGrid });
        }
      }
    }
  }

  function handleMouseLeave() {
    if (state.isStartNode) {
      const isStartNode = !state.isStartNode;
      setState({ ...state, isStartNode, mouseIsPressed: false });
    } else if (state.isFinishNode) {
      const isFinishNode = !state.isFinishNode;
      setState({ ...state, isFinishNode, mouseIsPressed: false });
    } else if (state.isWallNode) {
      const isWallNode = !state.isWallNode;
      setState({ ...state, isWallNode, mouseIsPressed: false });
    }
  }

  useEffect(() => {
    const g = getInitialGrid(state.ROW_COUNT, state.COLUMN_COUNT);
    setState({ ...state, grid: g });
  }, []);

  return (
    <div className="mx-auto my-8">
      <main className="flex flex-col gap-4 items-center">
        <div>
          <h1 className="text-2xl font-bold bg-emerald-400 text-emerald-700 rounded px-4 py-2 w-fit">
            Algorithms Graphics
          </h1>
          <h2>
            Developed by: <span>20BCE218</span> & <span>20BCE226</span>
          </h2>
        </div>
        <table className="" onMouseLeave={() => handleMouseLeave()}>
          <tbody>
            {state.grid?.map((row, rowIdx) => {
              return (
                <tr key={rowIdx}>
                  {row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    return (
                      <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={state.mouseIsPressed}
                        onMouseDown={(row, col) => handleMouseDown(row, col)}
                        onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                        onMouseUp={() => handleMouseUp(row, col)}
                        row={row}
                      ></Node>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-col">
          <label htmlFor="grid-size">
            Grid Size: {state.ROW_COUNT}X{state.COLUMN_COUNT}
          </label>
          <input
            id="grid-size"
            type="range"
            min={10}
            max={50}
            onChange={(e) =>
              setState({
                ...state,
                ROW_COUNT: e.target.value,
                COLUMN_COUNT: e.target.value,
                grid: getInitialGrid(e.target.value, e.target.value),
              })
            }
          />
        </div>
        <div className="">
          <Button onClick={() => clearGrid()}>Clear Grid</Button>
          <Button onClick={() => clearWalls()}>Clear Walls</Button>
          <Button onClick={() => visualize("Dijkstra")}>Dijkstra's</Button>
          <Button onClick={() => visualize("BFS")}>BFS</Button>
          <Button onClick={() => visualize("DFS")}>DFS</Button>
          <Button onClick={() => randomWalls()}>Random Maze</Button>
          <Button
            onClick={() => {
              console.log(state.FINISH_NODE_ROW, state.FINISH_NODE_COL);
              solveMaze(
                state.grid,
                state.START_NODE_ROW,
                state.START_NODE_COL,
                state.FINISH_NODE_ROW,
                state.FINISH_NODE_COL
              );

              for (const row of state.grid) {
                for (const node of row) {
                }
              }
            }}
          >
            Rat in Maze
          </Button>
        </div>
      </main>
    </div>
  );
}
function Button(props) {
  return (
    <button
      className="mx-2 bg-emerald-400 font-bold text-emerald-900 py-2 px-4 rounded-md hover:opacity-80"
      {...props}
    />
  );
}
// /******************** Create Walls ********************/
const getNewGridWithWallToggled = (grid, row, col) => {
  // mouseDown starts to act strange if I don't make newGrid and work off of grid instead.
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (!node.isStart && !node.isFinish && node.isNode) {
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
  }
  return newGrid;
};

// Backtracks from the finishNode to find the shortest path.
// Only works when called after the pathfinding methods.
function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
