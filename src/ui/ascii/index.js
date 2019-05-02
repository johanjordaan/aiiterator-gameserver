const _ = require('lodash')

const ToString = (state) => {
  return _.reduce(state.board,(acc,row,index)=>{
    const postFix = (index<2)?'\n---+---+---':''
    return `${acc} ${row[0]} | ${row[1]} | ${row[2]} ${postFix}\n`
  },'')
}

const ToSlug = (state) => {
  const move =  _.reduce(state.board,(acc,row)=>{
    return acc + _.reduce(row,(colCount,col)=>{
      return colCount + ((col !== ' ')?1:0)
    },0)
  },0)
  const shortId = state.id.substr(0,6)

  const playerPart = _.reduce(state.players,(acc,player,index)=>{
    const playerStr = `${player.userId}(${player.xoro})`
    const activeStr = (state.activePlayer === player.userId)?'*':''
    const infix = (index===1)?' vs ':''
    return `${acc}${infix}${activeStr}${playerStr}`
  },'')

  return `${playerPart} at move ${move} [${shortId}]`
}


module.exports = {
  ToString,
  ToSlug,
}
