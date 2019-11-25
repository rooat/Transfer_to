var config = require("../config")
var {arrs} = require("../files/address")

class TransClass {
    constructor(){

    }
    async start(){
        if(arrs && arrs.length>0){
            for(var i = 0;i<arrs.length;i++){
                await this.sendProcess(arrs[i])
            }
        }
        
        console.log("send completed!!!")
    }
    async sendProcess(obj){
        try {
            let gasPrice = await config.web3.eth.getGasPrice();
            let nonce = await config.web3.eth.getTransactionCount(obj.address, "pending");
            let bal = await config.web3.eth.getBalance(obj.address)
            let gas = await config.web3.eth.estimateGas({from:obj.address ,to:obj.to,value:bal})
            if(bal > gasPrice * gas){
                let value = bal - gasPrice * gas;
                let svalue = BigInt(value);
                var txObject = await config.web3.eth.accounts.signTransaction({
                  from:obj.address,
                  to: obj.to,
                  data: "",
                  gasPrice: gasPrice,
                  gas: gas,
                  nonce: nonce++,
                  value:String(svalue)
                }, obj.privateKey)//accounts.get(tx.sender)
                console.log("send raw.....========");
                await config.web3.eth.sendSignedTransaction(txObject.rawTransaction)
                  .once('transactionHash', this.onSended())
                  .once('receipt',this.confirm())
                  .once('error', this.onError())
            }
            
        } catch (e) {
            console.error("sending err:",e);
            return null;
        }
    }
    confirm(){
        return (receipt) =>{
            console.log(receipt)
        }
    }
    onSended(){
        return  (hash) => {
            console.log("hash----",hash)
          }
    }
    onError(){
        var doerror =  (error) => {
             console.log("transaction send error:",error);
           }
           return doerror
    }
}

var trans = new TransClass();
trans.start();