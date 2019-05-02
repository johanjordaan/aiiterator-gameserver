const imp = require('./imp')

const Info = () => {
  return imp.info
}

const Init = (seed,config) => {
  return imp.init(seed,config)
}

const Join = (state, userId) => {
  if(!imp.hasOpenSlots(state)) throw new Error('no open player slots')
  return imp.addPlayer(imp.setSeed(state), userId)
}

const GetActions = (state) => {
  return imp.generatePlayerActions(imp.setSeed(state))
}

const GetNextState = (state, userId, action) => {
  if(imp.isFinished(state)) throw new Error('finished')

  const actionToExecute = imp.actionLookup[action.name]
  if(actionToExecute === undefined) throw new Error(`unknown action [${action.name}]`)
  return actionToExecute(imp.setSeed(state), userId, action);
}

const GetOpenSlotCount = (state) => {
  return imp.getOpenSlots(state).size
}

const HasOpenSlots = (state) => {
  return imp.hasOpenSlots(state)
}

const IsFinished = (state) => {
  return imp.isFinished(state)
}

const GetRankings = (state) => {
  return imp.getRanking(state)
}

module.exports = {
  Info,
  Init,
  Join,
  GetActions,
  GetNextState,

  GetOpenSlotCount,
  HasOpenSlots,
  IsFinished,
  GetRankings,
}
