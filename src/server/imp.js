const _ = require('lodash')
const {
  Map,
  List,
  fromJS,
} = require('immutable')
const uuidv4 = require('uuid/v4');
const rnd = require('lcg-rnd')

const {
  Types,
  Actions,
  utils
} = require('aiiterator-core')

const info = {
  code: 'ttt',
  name: 'Tic-Tac-Toe',
  description: 'The classic game of Tic-Tac-Toe or Naughts and Crosses',
  minPlayerCount: 2,
  maxPlayerCount: 2,
}

const E = ' '
const X = 'X'
const O = 'O'

const boardLookup = {
  'LT':{name:'LT',row:0,col:0},
  'CT':{name:'CT',row:0,col:1},
  'RT':{name:'RT',row:0,col:2},

  'LC':{name:'LC',row:1,col:0},
  'CC':{name:'CC',row:1,col:1},
  'RC':{name:'RC',row:1,col:2},

  'LB':{name:'LB',row:2,col:0},
  'CB':{name:'CB',row:2,col:1},
  'RB':{name:'RB',row:2,col:2},
}

const init = (seed,config) => {
  const id = uuidv4()

  return Map({
    id,
    seed: (seed === null)?utils.hashCode(id):seed,
    board: List([List([E,E,E]),List([E,E,E]),List([E,E,E])]),
    players: List([
      Map({
        userId:null,
        xoro:null,
      }),
      Map({
        userId:null,
        xoro:null,
      })
    ]),
    playerLookup:Map({
    }),
    activePlayer:null,
    winner:null,
    draw:null,
  })
}

const selectRamdomPlayerId = (state) => {
  const validPlayerIds = state.get('playerLookup').keySeq()
  if(validPlayerIds.size == 0) return null
  const validPlayerIndex = rnd.rndIntBetween(0,validPlayerIds.size-1)
  return validPlayerIds.get(validPlayerIndex)
}

const addPlayer = (state,userId) => {
  const openPlayerSlots = state.get('players')
    .map((player,idx)=>[player.get('userId'),idx])
    .filter(([id,idx])=>id===null)
  const idx = openPlayerSlots.get(rnd.rndIntBetween(0,openPlayerSlots.size-1))[1]

  const newPlayer = Map({
    userId,
    xoro:idx===0?X:O,
  })
  const newPlayers = state.get('players').set(idx,newPlayer)
  const newPlayerLookup = state.get('playerLookup').set(userId,idx)

  const newState = state
    .set('players',newPlayers)
    .set('playerLookup',newPlayerLookup)

  return newState
    .set('activePlayer',selectRamdomPlayerId(newState))
}

const concede = (state, userId) => {
  const otherPlayerId = state
    .get('playerLookup')
    .keySeq()
    .filter((i)=>i!==userId)
    .get(0)

  return state
    .set('winner', otherPlayerId)
    .set('draw', null)
}


const getWinner = (state) => {
  const board = state.get('board')
  let winner = null

  // Rows
       if((board.get(0).get(0) == board.get(0).get(1)) && (board.get(0).get(1) == board.get(0).get(2)) && (board.get(0).get(0) != E)) winner = board.get(0).get(0)
  else if((board.get(1).get(0) == board.get(1).get(1)) && (board.get(1).get(1) == board.get(1).get(2)) && (board.get(1).get(0) != E)) winner = board.get(1).get(0)
  else if((board.get(2).get(0) == board.get(2).get(1)) && (board.get(2).get(1) == board.get(2).get(2)) && (board.get(2).get(0) != E)) winner = board.get(2).get(0)

  // Columns
  else if((board.get(0).get(0) == board.get(1).get(0)) && (board.get(1).get(0) == board.get(2).get(0)) && (board.get(0).get(0) != E)) winner = board.get(0).get(0)
  else if((board.get(0).get(1) == board.get(1).get(1)) && (board.get(1).get(1) == board.get(2).get(1)) && (board.get(0).get(1) != E)) winner = board.get(0).get(1)
  else if((board.get(0).get(2) == board.get(1).get(2)) && (board.get(1).get(2) == board.get(2).get(2)) && (board.get(0).get(2) != E)) winner = board.get(0).get(2)

  // Diagonals
  else if((board.get(0).get(0) == board.get(1).get(1)) && (board.get(1).get(1) == board.get(2).get(2)) && (board.get(0).get(0) != E)) winner = board.get(0).get(0)
  else if((board.get(0).get(2) == board.get(1).get(1)) && (board.get(1).get(1) == board.get(2).get(0)) && (board.get(0).get(2) != E)) winner = board.get(0).get(2)

  if(winner === null) return null
  else {
    return state.get('players').find((p)=>p.get('xoro')===winner).get('userId')
  }
}

const getValidMoves = (state) => {
  const board = state.get('board')
  const validMoves = _.reduce(_.toPairs(boardLookup),(acc,[code,position])=>{
    if(board.get(position.row).get(position.col) === E) {
      acc.push(position.name)
    }
    return acc
  },[])
  return validMoves
}

const getEmptySquares = (state) => {
  const board = state.get('board')
  const openSquares = _.reduce(_.toPairs(boardLookup),(acc,[code,position])=>{
    if(board.get(position.row).get(position.col) === E) {
      acc.push(position)
    }
    return acc
  },[])
  return openSquares
}

const play = (state, userId, positionCode) => {
  const board = state.get('board')
  const position = boardLookup[positionCode]
  const player = state.get('players').get(state.get('playerLookup').get(userId))

  let newBoard = null
  if(board.get(position.row).get(position.col) === E)
    newBoard = board.set(position.row,board.get(position.row).set(position.col,player.get('xoro')))
  else
    throw new Error("invalid move")

  const newState = state
    .set('board', newBoard)

  const winner = getWinner(newState)

  const nonActivePlayer = state.get('players').find((player)=>{
    return player.get('userId') !== state.get('activePlayer')
  })

  if(winner !== null) {
    return newState
      .set('winner',winner)
  } else {
    if(getEmptySquares(newState).length === 0) {
      return newState
        .set('draw',true)
    }
    else {
      return newState.
        set('activePlayer',nonActivePlayer.get('userId'))
    }
  }
}

// ------------------------------------------------------------------
const generatePlayerActions = (state) => {
  const activePlayer = state.get('activePlayer')
  const players = state.get('players').toJS()

  const playerActions = _.fromPairs(_.map(_.filter(players,(p)=>p.userId!==null),(player)=>{
    if(isFinished(state)) {
      return [player.userId,[]]
    } else if(hasOpenSlots(state)) {
      return [player.userId,[Actions.ActionTools.CreateVoidAction('concede')]]
    } else {
      if(player.userId === activePlayer) {

        return [player.userId,[
          Actions.ActionTools.CreateSelectOneAction('play','position',getValidMoves(state)),
          Actions.ActionTools.CreateVoidAction('concede'),
        ]]
      } else {
        return [player.userId,[
          Actions.ActionTools.CreateVoidAction('concede'),
        ]]
      }
    }
  }))

  return playerActions
}

const actionLookup = {
  concede: (state, userId, action) => {
    return concede(state, userId)
  },
  play: (state, userId, action) => {
    return play(state, userId, action.parameters.position)
  },
}

const hasWinner = (state) =>{
  return state.get('winner') !== null
}

const isDraw = (state) => {
  return state.get('draw') !== null
}

const isFinished = (state) => {
  return hasWinner(state) || isDraw(state)
}

const setSeed = (state,seed) => {
  if(seed === null || seed === undefined) {
    rnd.srand(state.get('seed'))
    return state
  } else {
    return state.set('seed',rnd.srand(seed))
  }
}

const getOpenSlots = (state) => {
  const openPlayerSlots = state.get('players')
    .map((player,idx)=>[player.get('userId'),idx])
    .filter(([id,idx])=>id===null)
  return openPlayerSlots
}

const hasOpenSlots = (state) => {
  return getOpenSlots(state).size>0
}

const getRanking = (state) => {
  if(!isFinished(state) || isDraw(state)) {
    return [state.get('players').filter((p)=>p.get('userId')!==null).map((player)=>player.get('userId')).toJS()]
  } else {
    return [
      [state.get('winner')],
      state.get('players').filter((p)=>p.get('userId')!=state.get('winner')).map((p)=>p.get('userId')).toJS()
    ]
  }
}

module.exports = {
  info,
  init,
  setSeed,
  addPlayer,
  generatePlayerActions,
  play,
  concede,
  actionLookup,
  getOpenSlots,
  hasOpenSlots,
  isFinished,
  getRanking,
  getValidMoves,

  getWinner,
  getEmptySquares,
  selectRamdomPlayerId,
}
