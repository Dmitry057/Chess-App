let wss;
Connect()
function Connect()
{
    log('connected to WebSocket')
    wss =  new WebSocket('wss://dima-vps.maff.io')
    wss.onMessage = function(event){}
}
