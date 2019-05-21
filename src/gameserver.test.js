const fs = require('fs')
describe('gameserver',()=>{
  describe('gameserver.json',()=>{
    const configStr = fs.readFileSync('./gameserver.json','utf-8')
    const config = JSON.parse(configStr)

    it('should have the ttt module exposed',()=>{
      expect(config.modules.length).toBe(1)
    })
  })
})
