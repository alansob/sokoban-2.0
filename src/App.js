import React, {useEffect, useReducer} from "react"

const LEVELS = [ // 0=playground, 1=wall, 2=box, 4=point, 5=player, 8=world
    [  
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [1,1,1,1,1,8,8,8,8,8,8,8,8,1,1,1,1,1],
      [1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,4,1],
      [1,0,2,0,0,0,0,2,0,0,0,0,0,0,5,0,4,1],
      [1,1,0,0,2,0,1,1,1,0,1,1,1,1,0,0,4,1],
      [1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,8,8,8,8,8,8,8],
    ],
  ]
//             0       1       2        3     4         5       6     7        8  
const COLOR = ["blue", "#777", "yellow", null, "orange", "#000", null, "green", "transparent"]
const COLOR_IN_PLACE = 7 
const ITEM = {
  Playground:       0,
  Wall:             1,
  Box:              2,
  Storage:          4,
  Player:           5,
  World:            8 
}
const GAME_STATE = { 
  Running:          "RUNNING", 
  Done:             "DONE" 
} 
const ACTION = {
  Move:             "MOVE", 
  RestartLevel:     "RESTART_LEVEL",
}
const DIRECTION = { 
  Left:             37, 
  Right:            39, 
  Up:               38, 
  Down:             40 
}

function getInitialState(levelNo) {
  const LEVEL = LEVELS[levelNo]
  let level = [], player = {x: null, y: null}, box = []
  for (let y=0; y<LEVEL.length; y++) {
    level[y] = []
    for (let x=0; x<LEVEL[y].length; x++) {
      if ( [ITEM.Box, ITEM.Player].includes(LEVEL[y][x])) 
        level[y][x] = ITEM.Playground 
      else 
        level[y][x] = LEVEL[y][x] 
      if (LEVEL[y][x] === ITEM.Box)     box.push({x:x, y:y})   
      if (LEVEL[y][x] === ITEM.Player)  player = {x:x, y:y}     
    }
  }
  return {
    levelNo:  levelNo,
    status:   GAME_STATE.Running,
    level, player, box
  }
}
function GameReducer(state, action) {
  switch (action.type) {
    case ACTION.RestartLevel:
      return {...getInitialState(state.levelNo), status: GAME_STATE.Running}
    case ACTION.PlayNextLevel:
      return {...getInitialState(state.levelNo+1), status: GAME_STATE.Running}
    case ACTION.Move:
      let d = {x: 0, y: 0} 
      console.log(action.keyCode)
      if (DIRECTION.Left === action.keyCode)  d.x-- 
      if (DIRECTION.Right === action.keyCode) d.x++
      if (DIRECTION.Up === action.keyCode)    d.y--
      if (DIRECTION.Down === action.keyCode)  d.y++
      if ( state.level[state.player.y+d.y][state.player.x+d.x] === ITEM.Wall) return {...state}
      if ( [...state.box].find(b => b.x===state.player.x+d.x && b.y===state.player.y+d.y) ) {
        if ( 
          [ITEM.Playground, ITEM.Storage].includes(state.level[state.player.y+2*d.y][state.player.x+2*d.x])  
          && ![...state.box].find(b => b.x === state.player.x+2*d.x && b.y === state.player.y+2*d.y)         
        ) { 
          let newState = {...state, player: {x: state.player.x+d.x, y: state.player.y+d.y}, box: [...state.box].map(b => {
            if ( (b.x === state.player.x+d.x) && (b.y === state.player.y+d.y) ) 
              return {x: b.x+d.x, y: b.y+d.y}
            else
              return b
          } ) }
          let boxesInPlace = 0
          newState.box.forEach(b=>{ if (newState.level[b.y][b.x] === ITEM.Storage) boxesInPlace++ })
          if (boxesInPlace === newState.box.length) return {...newState, status:GAME_STATE.Done}
          return newState
        } else 
          return {...state}
      }
      return {...state, player: {x: state.player.x+d.x, y: state.player.y+d.y}}
    default:  
  }
  return state
}
return (
  <div className="Sokoban">
    <div>SOKOBAN</div>
    <h3>Aby wygrać należy przesunąć skrzynki w odpowiednie miejsca</h3>
    <button onClick={()=> dispatch({type: ACTION.RestartLevel})}>Restart level</button>
    {state.status === GAME_STATE.Done && 
    <h3>Wygrałeś!</h3>}
      {[...state.level].map( (row, y) => {
        return <div key={`${y}`} style={{display: 'block', lineHeight: 0}}>{
          row.map( (col, x) => {return <div key={`${y}-${x}`} style={{backgroundColor: COLOR[getColor(y,x, col, state.player, state.box, state.level[y][x]===ITEM.Storage)], width: "20px", height:"20px", display:"inline-block", border: state.level[y][x]===ITEM.World ? '1px solid transparent': '1px solid #ccc'}}/>})  
        }</div> 
      })}
  </div>
);
