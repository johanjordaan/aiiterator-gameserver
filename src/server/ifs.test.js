const _ = require('lodash')
const should = require('should')

const {
  Types,
  Actions,
  utils
} = require('aiiterator-core')

const TTT = require('./index')

describe('tictactoe',()=>{

  describe('core',()=>{
    describe('Info',()=>{
      it('should return the correct info object',()=>{
        TTT.Info().should.be.a.Object()
      })
    })

    describe('Init',()=>{
      let state = TTT.Init()
      it('should return the correct initial game object',()=>{
        state.should.be.a.Object()
      })
    })

    describe('Join',()=>{
      let state = TTT.Init()
      it('should allow users to join if this is a new game',()=>{
        state = TTT.Join(state,'johan')
      })
      it('should allow users to join while there is open slots',()=>{
        let i=0;
        while(TTT.GetOpenSlotCount(state)>0) {
          state = TTT.Join(state,'lorraine'+i)
        }
      })
      it('should fail if a user wants to join a game that is full',()=>{
        const f = () => { TTT.Join(state,'abigail') }
        f.should.throw(
          {message:"no open player slots"}
        )
      })
    })

    describe('GetActions',()=>{
      let state = TTT.Init()
      state = TTT.Join(state,'johan')
      state = TTT.Join(state,'lorraine')

      let actions = TTT.GetActions(state)

      it('should return the actions for each player',()=>{
        actions.should.be.a.Object()
        actions.should.have.property('johan').which.is.a.Array()
        actions.should.have.property('lorraine').which.is.a.Array()
      })
    })

    describe('GetNextState',()=>{
      let state = TTT.Init()
      state = TTT.Join(state,'johan')
      state = TTT.Join(state,'lorraine')

      let actions = TTT.GetActions(state)

      it('should get the next state based on the actions of a user',()=>{
        const users = _.keys(actions)
        const userActions = actions[users[0]]
        const selectedAction = Actions.ActionTools.SelectFirstActionFirstOption(userActions)
        state = TTT.GetNextState(state,users[0],selectedAction)
        state.should.be.a.Object()
      })

      it('should throw an error when the game is finised and a next state is requested',()=>{
        state2 = TTT.GetNextState(state,'johan',{name:"concede"})
        const f = () => {
          TTT.GetNextState(state2,'johan',{name:"concede"})
        }
        f.should.throw({message:'finished'})
      })

      it('should throw an error if an unknown action is called',()=>{
        const f = () => {
          TTT.GetNextState(state,'johan',{name:"xxx"})
        }
        f.should.throw({message:'unknown action [xxx]'})
      })

    })
  })

  describe('info',()=>{
    describe('GetOpenSlotCount',()=>{
      let state = TTT.Init()
      it('should return at last 1 open slot for a new game',()=>{
        TTT.GetOpenSlotCount(state).should.be.aboveOrEqual(1)
      })
    })

    describe('HasOpenSlots',()=>{
      let state = TTT.Init()
      it('should have openslots when a new game is started',()=>{
        TTT.HasOpenSlots(state).should.equal(true)
      })
    })



    describe('IsFinished',()=>{
      let state = TTT.Init()
      it('should detect that a new game is not finisehd',()=>{
        TTT.IsFinished(state).should.equal(false)
      })
    })

    describe('GetRankings',()=>{
      let state = TTT.Init(321)
      state = TTT.Join(state,'johan')
      state = TTT.Join(state,'lorraine')
      it('should return the current player ranking',()=>{
        TTT.GetRankings(state).should.eql([['lorraine','johan']])
      })
    })
  })

})
