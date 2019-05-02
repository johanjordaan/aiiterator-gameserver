const should = require('should')

const ifs = require('../../server/ifs')
const ascii = require('./')


describe('tictactoe',()=>{
  describe('ui',()=>{
    describe('ascii',()=>{
      describe('ToString',()=>{
          const initial = ifs.Init().toJS()

          it('should render an empty board',()=>{
            ascii.ToString(initial).should.eql(
              '   |   |   \n'+
              '---+---+---\n'+
              '   |   |   \n'+
              '---+---+---\n'+
              '   |   |   \n'
            )
          })
      })

      describe('ToSlug',()=>{
        const johan  = {id:"johan"}
        const lorraine  = {id:"lorraine"}

        let state = ifs.Init(123)
        state = ifs.Join(state,lorraine.id)
        state = ifs.Join(state,johan.id)

        it('should return a descriptive slug',()=>{
          const shortId = state.get('id').substr(0,6)
          ascii.ToSlug(state.toJS()).should.match(`lorraine(X) vs *johan(O) at move 0 [${shortId}]`)
        })

        it('should return a descriptive slug',()=>{
          state = state.set('board',[['X','X','X'],['O','O',' '],[' ',' ',' ']])
          const shortId = state.get('id').substr(0,6)
          ascii.ToSlug(state.toJS()).should.match(`lorraine(X) vs *johan(O) at move 5 [${shortId}]`)
        })

      })

    })
  })
})
