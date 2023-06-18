import requests

payload = {
    'content':"hello hi"
}
header={
    'Authorization':'NDM2ODc2MTUwMTMyOTY1Mzc3.GG0KFh.xP3x4VuHPLB56yhKRxBlubPmRmGcrqJfzbvSnk'
}
r=requests.post("https://discord.com/api/v9/channels/1118789953233629228/messages",data=payload,headers=header)