import React, { Component } from "react";

import "../assets/node.css";
export default function Node({
  col,
  isFinish,
  isStart,
  isWall,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  row,
}) {
  let extraClassName = "";
  if (isFinish) {
    extraClassName = "node-finish";
  }
  if (isStart) {
    extraClassName = "node-start";
  }
  if (isWall) {
    extraClassName = "node-wall";
  }
  return (
    <td
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    ></td>
  );
}
