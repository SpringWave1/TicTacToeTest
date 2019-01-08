// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// import Web3 from 'web3';
import $ from "jquery";

// Import our contract artifacts and turn them into usable abstractions.
import TicTacToeArtifact from '../../build/contracts/TicTacToe.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const TicTacToe = contract(TicTacToeArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account
var TicTacToeInstance
var nextPlayerEvent;
var gameOverWithWinEvent;
var gameOverWithDrawEvent;

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    TicTacToe.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        console.log(err)
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]
    })
  },

  useAccountOne: function(){
    account = accounts[1];
    console.log('Use account 2 for game')
  },

  createNewGame: function(){
    console.log('create game called');
    TicTacToe.new({from: account, value:web3.toWei('0.1',"ether"), gas:3000000}).then(instance =>{
      TicTacToeInstance = instance;
      
      // 改变样式
      $(".in-game").show();
      $(".waiting-for-join").hide();
      $(".game-start").hide();
      $("#game-address").text(TicTacToeInstance.address);
      $("#waiting").show();
      // 监听事件 侦查其他加入的用户所触发的事件
      var playerJoinedEvent = TicTacToeInstance.PlayerJoined();

      playerJoinedEvent.watch(function(error, eventObj){
        playerJoinedEvent.stopWatching();
        if(!error){
          console.log('eventOBj:', eventObj)
          $(".waiting-for-join").show();
          $("#opponent-address").text(eventObj.args.player);
          // set click handler
          for(var i=0;i<3;i++){
            for(var j=0;j<3;j++){
              $($("#board")[0].children[0].children[i].children[j]).off('click').click({x:i,y:j}, App.setStone);
            }
          }
        }else{
          console.log(error)
        }
      });

      App.listenToEvents();
      console.log(instance);
      // console.log(instance)
    }).catch(error =>{
      console.log(error);
    })
  },
  joinGame: function(){
    console.log('Join game called');
    var gameAddress = prompt("Address of the game");
    if(gameAddress != null){
      // TicTacToeInstance = await TicTacToe.at(gameAddress)
      // console.log("at", instance == null, instance)
      TicTacToe.at(gameAddress).then(instance =>{
        TicTacToeInstance = instance;
        console.log(instance)
        App.listenToEvents();
        return TicTacToeInstance.joinGame({from: account, value:web3.toWei('0.1',"ether"), gas:3000000});
      }).then(txResult =>{

        $(".in-game").show();
        $(".game-start").hide();
        $("#game-address").text(TicTacToeInstance.address);
        $("#waiting").hide();

        TicTacToeInstance.player1.call().then(playerAddress =>{
          $("#opponent-address").text(playerAddress);
        })
        // set click handler
        for(var i=0;i<3;i++){
          for(var j=0;j<3;j++){
            $($("#board")[0].children[0].children[i].children[j]).off('click').click({x:i,y:j}, App.setStone);
          }
        }
        console.log(txResult)

      }).catch(err =>{
        console.log(err)
      })
    }
  },

  listenToEvents: function(){
      nextPlayerEvent = TicTacToeInstance.NextPlayer();
      nextPlayerEvent.watch(App.nextPlayer);

      gameOverWithWinEvent = TicTacToeInstance.GameOverWithWin();
      gameOverWithWinEvent.watch(App.gameOver);

      gameOverWithDrawEvent = TicTacToeInstance.GameOverWithDraw();
      gameOverWithDrawEvent.watch(App.gameOver);
      
  },

  gameOver: function(err, eventObj){
    console.log("Game over", eventObj);
    if(eventObj.event == "GameOverWithWin"){
      if(eventObj.args.winner == account){
        alert("Congratulations, You win！");
      }else{
        alert("Woops, you lost! Try again....")
      }
    }else{
      alert("That's a draw")
    }

    nextPlayerEvent.stopWatching();
    gameOverWithDrawEvent.stopWatching();
    gameOverWithWinEvent.stopWatching();
  },

  setStone: function(event){
    console.log(event)
    TicTacToeInstance.setStone(event.data.x, event.data.y,{from: account}).then(txResult =>{
      // console.log(txResult);
      App.printBoard()
    })
  },
  printBoard: function () {
    TicTacToeInstance.returnBoard.call().then(board =>{
      for(var i= 0; i< board.length; i++){
        for(j = 0; j< board.length; j++){
          if(board[i][j] == account){
            $("#board").children[0].children[i].children[j].innerHTML = "X";
          }else if(board[i][j]!=0){
            $("#board").children[0].children[i].children[j].innerHTML = "O";
          }
        }
      }
      
    });
    }

}

window.App = App


// how to link to node
window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // use geth need to change to 8545

    var options = {
      timeout: 20000, // milliseconds,
      headers: [{name: 'Access-Control-Allow-Origin', value: ''}]
    }; 

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start()
})
