import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  if(props.isWinnerSquare){
    return (
      <button className="square-winner" onClick={props.onClick}>
        {props.value}
      </button>
    );
  } else {
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
}

class Board extends React.Component {

  renderSquare(i) {
    let isWinnerSquare = false;
    if(this.props.winnerSquares){
      isWinnerSquare = this.props.winnerSquares.includes(i);
    }
    return (
      <Square
        value={this.props.squares[i]}
        onClick={()=> this.props.onClick(i)}
        isWinnerSquare={isWinnerSquare}
      />
    );
  }

  createBoard = () => {
    let squareId = 0;
    let boardItems = [];

    for(let r = 0; r < 3;  r++){
      let rowItems = [];
      for(let c = 0; c < 3; c++){
        rowItems.push(
          this.renderSquare(squareId)
        );
        squareId++;
      }
      boardItems.push(<div className="board-row">{rowItems}</div>)
    }
    return boardItems;
  }

  render() {
    return (
      <div>
        {this.createBoard()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      descendingMoves: true,
    };
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  reorderMoves(){
    this.setState({
      descendingMoves: !this.state.descendingMoves,
    });
  }

  createMoveList(history) {
    let oldStep;
    return history.map((step, move) => {
      let moveCoordinates;
      if(oldStep){
        for(let i = 0; i < step.squares.length; i++){
          if(oldStep.squares[i] !== step.squares[i]){
            let column = Math.floor(i/3);
            let row = i - (column)*3;
            moveCoordinates = ' (' + ++column + ',' + ++row + ')';
          }
        }
      }
      let desc = move ?
        'Go to move #' + move  + moveCoordinates:
        'Go to game start';
      if(move === this.state.stepNumber){
        desc = <strong>{desc}</strong>
      }
      oldStep = step;
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
  }

  createDescendingMoveList(history) {
    return this.createMoveList(history);
  }

  createAscendingMoveList(history) {
    return this.createMoveList(history).reverse();
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerSquares = calculateWinner(current.squares);
    let moves = [];

    if(this.state.descendingMoves){
      moves = this.createDescendingMoveList(history);
    } else {
      moves = this.createAscendingMoveList(history);
    }

    let status;
    if(winnerSquares) {
      status = 'Winner ' + current.squares[winnerSquares[1]];
    } else if(current.squares.every((value) => {return value != null})){
      status = 'Game is a draw.';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            onClick = {(i) => this.handleClick(i)}
            winnerSquares = {winnerSquares}/>
        </div>

        <div className="game-info">
          <button onClick = {() => this.reorderMoves()}>
            {this.state.descendingMoves ? 'Ascending' : 'Descending'}
          </button>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}
