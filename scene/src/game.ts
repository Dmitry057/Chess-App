let wss;
Connect()

function Connect_From_Button()
{
let cube = new Entity()
cube.addComponent(new Transform({
    position: new Vector3(8,3,8)
}))
cube.addComponent(new BoxShape())
engine.addEntity(cube)

cube.addComponent(
    new OnClick(() => {
        engine.removeEntity(cube)
        wss = Connect()
    }))
}

function Connect()
{
    return new WebSocket('wss://dima-vps.maff.io')
}
