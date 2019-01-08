import { AssertionError } from "assert";

var TicTacToe = artifacts.require("TicTacToe");


contract("TicTacToe", function(accounts){
    // console.log(accounts)
    it("should have an empty board at the beginning", function(){
        var TicTacToeInstance;
        var player1 = accounts[0];
        var player2 = accounts[1];
        return TicTacToe.new({from: player1, value: web3.utils.toWei('0.1', "ether")}).then(instance =>{
            TicTacToeInstance = instance;
            return TicTacToeInstance.joinGame({from: player2, value: web3.utils.toWei('0.1', 'ether')});
        }).then(txResult =>{
            // adddress for the game player2
            // console.log(txResult.logs[1].args)

            return TicTacToeInstance.setStone(0,0, {from: txResult.logs[1].args.player});
        }).then(txResult =>{
            // console.log(txResult)
            return TicTacToeInstance.setStone(0,1, {from: txResult.logs[0].args.player});
        }).then(txResult =>{
            return TicTacToeInstance.setStone(1,0, {from: txResult.logs[0].args.player});
        }).then(txResult =>{
            return TicTacToeInstance.setStone(1,1, {from: txResult.logs[0].args.player});
        }).then(txResult =>{
            return TicTacToeInstance.setStone(2,0, {from: txResult.logs[0].args.player});
        }).then(txResult =>{
            console.log(txResult)
            assert(txResult.logs[0].event, "GameOverWithWin"," one player have won");
        }).catch(err =>{
            console.log(err);
        })
    })
});