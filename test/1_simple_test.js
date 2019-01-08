var TicTacToe = artifacts.require("TicTacToe");


contract("TicTacToe", function(accounts){
    // console.log(accounts)
    it("should have an empty board at the beginning", function(){
        return TicTacToe.new({from: accounts[0], value: web3.utils.toWei('0.1', "ether")}).then(instance =>{
            return instance.returnBoard.call();
        }).then(board =>{
            assert.equal(board[0][0], 0,"The first row and colomn must be empty");
            console.log(board);
        }).catch(err =>{
            console.log(err);
        })
    })
});