const _ = require('lodash')
const should = require('should')
const {
  Map,
  List,
  fromJS,
} = require('immutable')

const {
  Types,
  Actions,
  utils
} = require('aiiterator-core')


const imp = require('./imp')

describe('tictactoe',()=>{
  describe('init',()=>{

    const ttt = imp.init(null,{})

    describe('create a valid initial state',()=>{

      it('should have a valid id property',()=>{
        ttt.get('id').length.should.equal(36)
      })

      it('should have a valid board property',()=>{
        ttt.get('board').toJS().should.eql([[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']])
      })

      it('should have a valid players property',()=>{
        ttt.get('players').toJS().should.eql([
          {
            userId:null,
            xoro:null,
          },{
            userId:null,
            xoro:null,
          },
        ])
      })

      it('should have a valid player lookup dictionary',()=>{
        ttt.get('playerLookup').toJS().should.eql({})
      })

      it('should have a valid uninitiated draw property',()=>{
        should(ttt.get('draw')).eql(null)
      })

      it('should have a valid uninitiated winner property',()=>{
        should(ttt.get('winner')).eql(null)
      })

      it('should have a valid uninitiated activePlayer property',()=>{
        should(ttt.get('activePlayer')).eql(null)
      })

      it('should have a seed thats a derivative of the id',()=>{
        ttt.get('seed').should.eql(utils.hashCode(ttt.get('id')))
      })
    })
  })

  describe('setSeed',()=>{
    const state = imp.init(null,{})
    const newState = imp.setSeed(state,123)
    const newState2 = imp.setSeed(newState)
    it('should set the seed to the provided value',()=>{
      newState.get('seed').should.eql(123)
    })
    it('should set the seed to the existing',()=>{
      newState2.get('seed').should.eql(123)
    })
  })

  describe('addPlayer',()=>{

    const user1 = "johan"
    const user2 = "lorraine"

    const initial = imp.init()
    const afterUser1 = imp.addPlayer(initial,user1)
    const afterUser2 = imp.addPlayer(afterUser1,user2)

    it('should add the first user in a random spot',()=>{
      (
        afterUser1.get('players').get(0).get('userId') === "johan" ||
        afterUser1.get('players').get(1).get('userId') === "johan"
      ).should.equal(true)
    })

    const idx = afterUser2.get('playerLookup').get('johan')
    const idx2 = afterUser2.get('playerLookup').get('lorraine')


    it('should update the playerLookup table',()=>{
      afterUser2.get('players').get(idx).get('userId').should.equal("johan")
      afterUser2.get('players').get(idx2).get('userId').should.equal("lorraine")
    })

    it('should set the active player',()=>{
      (
        afterUser2.get('activePlayer') === "johan" ||
        afterUser2.get('activePlayer') === "lorraine"
      ).should.equal(true)
    })

  })

  describe('concede',()=>{
    const user1 = "johan"
    const user2 = "lorraine"

    const initial = imp.init()
    const afterUser1 = imp.addPlayer(initial,user1)
    const afterUser2 = imp.addPlayer(afterUser1,user2)

    const afterConcede = imp.concede(afterUser2,user1)

    it("should mark the other player as the winner",()=>{
      afterConcede.get('winner').should.equal(user2)
      should(afterConcede.get('draw')).equal(null)
    })
  })

  describe('getEmptySquares', () => {
    const user1 = "johan"
    const user2 = "lorraine"

    const initial = imp.init()
    const afterUser1 = imp.addPlayer(initial,user1)
    const afterUser2 = imp.addPlayer(afterUser1,user2)

    it('should return all 9 squares as the open squares for a new state',()=>{
      const emptySquares = imp.getEmptySquares(afterUser2)
      emptySquares.length.should.equal(9)
    })
  })

  describe('getValidMoves', () => {
    const user1 = "johan"
    const user2 = "lorraine"

    const initial = imp.init()
    const afterUser1 = imp.addPlayer(initial,user1)
    const afterUser2 = imp.addPlayer(afterUser1,user2)

    it('should return all 9 positions as valid for a new game',()=>{
      const validMoves = imp.getValidMoves(afterUser2)
      validMoves.length.should.equal(9)
      validMoves.should.eql([ 'LT', 'CT', 'RT', 'LC', 'CC', 'RC', 'LB', 'CB', 'RB' ])
    })

    it('should the 8 moves left after the firts move',()=>{
      const afterMove = imp.play(afterUser2,'johan','CC')
      const validMoves = imp.getValidMoves(afterMove)

      validMoves.length.should.equal(8)
      validMoves.should.eql([ 'LT', 'CT', 'RT', 'LC', 'RC', 'LB', 'CB', 'RB' ])
    })


  })


  describe('getWinner',()=>{
    const johan = "johan"
    const lorraine = "lorraine"

    let state = imp.init()
    state = imp.addPlayer(state,johan)
    state = imp.addPlayer(state,lorraine)

    const j = state.get('players').get(state.get('playerLookup').get('johan')).get('xoro')
    const l = state.get('players').get(state.get('playerLookup').get('lorraine')).get('xoro')
    const e = ' '
    it('should detect row winning',()=>{
      imp.getWinner(state.set('board',fromJS([[j,j,j],[e,e,e],[e,e,e]]))).should.equal(johan)
      imp.getWinner(state.set('board',fromJS([[e,e,e],[l,l,l],[e,e,e]]))).should.equal(lorraine)
      imp.getWinner(state.set('board',fromJS([[e,e,e],[e,e,e],[l,l,l]]))).should.equal(lorraine)
    })

    it('should detect column winning',()=>{
      imp.getWinner(state.set('board',fromJS([[j,e,e],[j,e,e],[j,e,e]]))).should.equal(johan)
      imp.getWinner(state.set('board',fromJS([[e,l,e],[e,l,e],[e,l,e]]))).should.equal(lorraine)
      imp.getWinner(state.set('board',fromJS([[e,e,j],[e,e,j],[e,e,j]]))).should.equal(johan)
    })

    it('should detect diagonal winning',()=>{
      imp.getWinner(state.set('board',fromJS([[j,e,e],[e,j,e],[e,e,j]]))).should.equal(johan)
      imp.getWinner(state.set('board',fromJS([[l,e,e],[e,l,e],[e,e,l]]))).should.equal(lorraine)
    })
  })

  describe('generatePlayerActions',()=>{
    const user1 = "johan"
    const user2 = "lorraine"

    let state = imp.init(123,{})
    const actions = imp.generatePlayerActions(state)
    it('should return no actions if there is no players',()=>{
      actions.should.eql({})
    })

    state = imp.addPlayer(state,user1)
    const actions2 = imp.generatePlayerActions(state)
    it('should return only the actions for the joined users',()=>{
      _.keys(actions2).should.eql([user1])
    })

    state = imp.addPlayer(state,user2)
    const actions3 = imp.generatePlayerActions(state)
    it('should return only the actions for the joined users',()=>{
      _.keys(actions3).should.eql([user1,user2])
    })

    const drawState = state.set('draw',true)
    drawActions = imp.generatePlayerActions(drawState)
    it('should return no action if its a draw',()=>{
      _.keys(drawActions).should.eql([user1,user2])
      drawActions[user1].should.eql([])
      drawActions[user2].should.eql([])
    })


    const winnerState = state.set('winner','lorraine')
    winnerActions = imp.generatePlayerActions(winnerState)
    it('should return no action if its a finised(winner) game',()=>{
      _.keys(winnerActions).should.eql([user1,user2])
      winnerActions[user1].should.eql([])
      winnerActions[user2].should.eql([])
    })

  })


  describe('play',()=>{
    const user1 = "johan"
    const user2 = "lorraine"

    let state = imp.init()
    state = imp.addPlayer(state,user1)
    state = imp.addPlayer(state,user2)

    const idx1 = state.get('playerLookup').get('lorraine')
    const lorraine = state.get('players').get(idx1)
    const idx2 = state.get('playerLookup').get('johan')
    const johan = state.get('players').get(idx2)

    it('should play the move supplied',()=>{
      state = imp.play(state, user1, "CC")
      imp.getEmptySquares(state).length.should.equal(8)
      state = imp.play(state, user2, "LT")
      imp.getEmptySquares(state).length.should.equal(7)
      state = imp.play(state, user1, "RT")
      imp.getEmptySquares(state).length.should.equal(6)

      const board = state.get('board');
      board.get(1).get(1).should.equal(johan.get('xoro'))
      board.get(0).get(2).should.equal(johan.get('xoro'))
      board.get(0).get(0).should.equal(lorraine.get('xoro'))
    })

    it('should throw an expetion if an invalid move is made',()=>{
      should.throws(()=>{
        imp.play(state, user1, "CC")
      },"???")
    })

    it('should play until a win/loss',()=>{
      let state = imp.init()
      state = imp.addPlayer(state,user1)
      state = imp.addPlayer(state,user2)

      state = imp.play(state, user1, "LT")
      state = imp.play(state, user2, "CT")
      state = imp.play(state, user1, "RT")
      state = imp.play(state, user2, "LC")
      state = imp.play(state, user1, "CC")
      state = imp.play(state, user2, "RC")
      state = imp.play(state, user1, "LB")
      should(state.get('draw')).equal(null)
      state.get('winner').should.equal(user1)
    })

    it('should play until a draw',()=>{
      let state = imp.init()
      state = imp.addPlayer(state,user1)
      state = imp.addPlayer(state,user2)

      state = imp.play(state, user1, "LT")
      state = imp.play(state, user2, "RT")
      state = imp.play(state, user1, "CT")
      state = imp.play(state, user2, "CC")
      state = imp.play(state, user1, "RC")
      state = imp.play(state, user2, "LC")
      state = imp.play(state, user1, "LB")
      state = imp.play(state, user2, "RB")
      state = imp.play(state, user1, "CB")
      imp.getEmptySquares(state).length.should.equal(0)
      should(state.get('winner')).equal(null)
      state.get('draw').should.equal(true)
    })
  })

  describe('selectRamdomPlayerId',()=>{
    const state = imp.init()
    it('should return null if there is no players yet',()=>{
      should(imp.selectRamdomPlayerId(state)).equal(null)
    })

    const johan = {id:"johan"}
    const state2 = imp.addPlayer(state,johan.id)
    it('should return the user if there is only one',()=>{
      imp.selectRamdomPlayerId(state2).should.eql(johan.id)
    })

    const lorraine  = {id:"lorraine"}
    const state3 = imp.addPlayer(state2,lorraine.id)
    it('should return the one of the users if there is more than one',()=>{
      const selectedPlayerId = imp.selectRamdomPlayerId(state3);

      (
        (selectedPlayerId === johan.id) ||
        (selectedPlayerId === lorraine.id)
      ).should.equal(true)
    })
  })

  describe('actionLookup',()=>{
    let state = imp.init(null,{})
    state = imp.addPlayer(state,'johan')
    it('should call conced',()=>{
      imp.actionLookup.concede(state,'johan')
    })
    it('should call play',()=>{
      imp.actionLookup.play(state,'johan',{parameters:{position:'CC'}})
    })
  })

  describe('getRanking',()=>{
    let state = imp.init(333,{})
    state = imp.addPlayer(state,'johan')
    state = imp.addPlayer(state,'lorraine')

    it('should rank all players the same if the game is in progress',()=>{
      imp.getRanking(state).should.eql([['lorraine','johan']])
    })

    it('should rank all players the same is a draw',()=>{
      const drawState = state.set('draw',true)
      imp.getRanking(drawState).should.eql([['lorraine','johan']])
    })

    it('should rank all players the same is a draw',()=>{
      const winState = state.set('winner','lorraine')
      imp.getRanking(winState).should.eql([['lorraine'],['johan']])
    })


  })
})
