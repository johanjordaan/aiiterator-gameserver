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


const ifs = require('./ifs')

describe('tictactoe',()=>{
  describe('scenarios',()=>{
    const johan  = {id:"johan"}
    const lorraine  = {id:"lorraine"}
    const abigail  = {id:"abigail"}

    it('base join scenario',()=>{
      let state = ifs.Init()
      state = ifs.Join(state,lorraine.id)
      ifs.HasOpenSlots(state).should.equal(true)
      state = ifs.Join(state,johan.id)
      ifs.HasOpenSlots(state).should.equal(false)

      const f = () => ifs.Join(state,johan.id)
      f.should.throw({message:'no open player slots'})
    })


    it("play a sample 1st move game",()=>{
      let state = ifs.Init(999)
      state = ifs.Join(state,johan.id)
      state = ifs.Join(state,lorraine.id)

      let action = null
      let activePlayer = null
      let escapeCounter = 0
      while(escapeCounter<20) {


        const actions = ifs.GetActions(state)

        if(ifs.IsFinished(state)) break;
        action = Actions.ActionTools.SelectFirstActionFirstOption(actions.johan)
        if(action.name !== 'concede')
          state = ifs.GetNextState(state,johan.id,action)

        if(ifs.IsFinished(state)) break;
        action = Actions.ActionTools.SelectFirstActionFirstOption(actions.lorraine)
        if(action.name !== 'concede')
          state = ifs.GetNextState(state,lorraine.id,action)

        escapeCounter+=1
      }

      escapeCounter.should.be.below(20)
      ifs.IsFinished(state).should.equal(true)
      const result = ifs.GetRankings(state)
      result.should.eql([['lorraine'],['johan']])
    })

    it("play a game where one player conceded after 2 moves",()=>{
      let state = ifs.Init(1134)
      state = ifs.Join(state,johan.id)
      state = ifs.Join(state,lorraine.id)

      let action = null
      let escapeCounter = 0
      while(!ifs.IsFinished(state) && escapeCounter<20) {

        if(ifs.IsFinished(state)) break;
        let actions = ifs.GetActions(state)
        if(escapeCounter>=3) {
          action = Actions.ActionTools.CreateVoidAction('concede')
        } else {
          action = Actions.ActionTools.SelectFirstActionFirstOption(actions.johan)
        }
        state = ifs.GetNextState(state,johan.id,action)
        actions = ifs.GetActions(state)

        if(ifs.IsFinished(state)) break;
        action = Actions.ActionTools.SelectFirstActionFirstOption(actions.lorraine)
        state = ifs.GetNextState(state,lorraine.id,action)

        escapeCounter+=1
      }

      escapeCounter.should.be.below(20)
      ifs.IsFinished(state).should.equal(true)
      const result = ifs.GetRankings(state)
      result.should.eql([['lorraine'],['johan']])
    })


    describe("play a game where one player sends an invalid option",()=>{
      let state = ifs.Init(1134)
      state = ifs.Join(state,johan.id)
      state = ifs.Join(state,lorraine.id)

      let action = null

      const f = () => ifs.GetNextState(state,johan.id,Actions.ActionTools.CreateVoidAction("win"))

      f.should.throw({message:'unknown action [win]'})
    })
  })
})
