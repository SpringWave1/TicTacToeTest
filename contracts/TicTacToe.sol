pragma solidity ^0.5.0;

contract TictacToe {
    uint constant public gameCost = 0.1 ether;
    
    uint8 public boardSize = 3;
    uint8 movesCounter;

    
    bool gameActive;
    
    
    uint8 timeToReact = 3 minutes;
    uint gameValidUtil;
    
    address[3][3] board;
    
    address payable public player1;
    address payable public player2;
    
    uint balanceToWithdrawPlayer1;
    uint balanceToWithdrawPlayer2;
    
    address payable activePlayer;
    // the name for event should be capitalized
    event PlayerJoined(address player);
    event NextPlayer(address player);
    event GameOverWithWin(address winner);
    event GameOverWithDraw();
    event PayOutSuccess(address receiver, uint amountInWei);
    
    constructor() public payable{
        player1 = msg.sender;
        require(msg.value == gameCost);
        gameValidUtil = timeToReact;
    }
    
    function joinGame() public payable{
        assert(player2 == address(0));
        gameActive = true;
        
        require(msg.value == gameCost);
        
        player2 = msg.sender;
        emit PlayerJoined(player2);
        // 轮流加入轮流加入轮流you xi
        if(block.number % 2 ==0){
            activePlayer = player2;
        }else{
            activePlayer = player1;
        }
        
        gameValidUtil = now + timeToReact;
        emit NextPlayer(activePlayer);
    }
    
    // returns now must follow a memory
    function returnBoard() public view returns(address[3][3] memory) {
        return board;
    }
    
    // using payable to decorate address before send
    function setWinner(address payable player) private{
        gameActive = false;
        // emit an event
        emit GameOverWithWin(player);
        // this represent the contract to send balance
        // transfer will roll back all the transaction
        // now need address(this) to get the contract address
        if(player.send(address(this).balance) != true){
            if(player == player1){
                balanceToWithdrawPlayer1 = address(this).balance;
            }else{
                balanceToWithdrawPlayer2 = address(this).balance;
            }
        }
        // transfer money to winner
        else{
            emit PayOutSuccess(player, address(this).balance);
        }
    }
    
    function withDrawWin() private{
        if(msg.sender == player1){
            require(balanceToWithdrawPlayer1 >0);
            balanceToWithdrawPlayer1 = 0;
            
            player1.transfer(balanceToWithdrawPlayer1);
            
            emit PayOutSuccess(player1, balanceToWithdrawPlayer1);
        }
        else{
            require(balanceToWithdrawPlayer2 >0);
            balanceToWithdrawPlayer2 = 0;
            player2.transfer(balanceToWithdrawPlayer2);
            
            emit PayOutSuccess(player2, balanceToWithdrawPlayer2);
        }
    }
    
    function setDraw() private{
        gameActive = false;
        emit GameOverWithDraw();
        
        // send balance back to player
        uint balanceToPayOut = address(this).balance / 2;
        if(player1.send(balanceToPayOut) == false){
            balanceToWithdrawPlayer1 += balanceToPayOut;
        }else{
            emit PayOutSuccess(player1, balanceToPayOut);
        }
        if(player2.send(balanceToPayOut) == false){
            balanceToWithdrawPlayer2 += balanceToPayOut;
        }
        else{
            emit PayOutSuccess(player2, balanceToPayOut);
        }
    }
    
    function emergencyCashOut() public{
        require(gameValidUtil < now);
        require(gameActive);
        setDraw();
    }
    
    function setStone(uint8 x, uint8 y) public{
        require(board[x][y] == address(0));
        require(gameValidUtil > now);
        assert(gameActive);
        assert(x < boardSize);
        assert(y < boardSize);
        require(activePlayer == msg.sender);
        
        board[x][y] = msg.sender;
        
        movesCounter ++;
        gameValidUtil = now + timeToReact;
        
        for(uint8 i =0; i< boardSize; i++){
            if(board[i][y] != activePlayer){
                break;
            }
            // win
            if(i == boardSize -1){
                setWinner(activePlayer);
                return;
            }
        }
        
        for(uint8 i = 0; i < boardSize; i++){
            if(board[i][x] != activePlayer){
                break;
            }
            // win

            if(i == boardSize -1){
                setWinner(activePlayer);
                return;
            }
        }
        
        // diagonale
        if(x == y){
            for(uint8 i = 0; i < boardSize; i++){
                if(board[i][i] != activePlayer){
                    break;
                }
                // win
                if(i == boardSize -1){
                    setWinner(activePlayer);
                    return;
                }
            }
        }
        
        
        // anti-diagonale
        if((x+y) == boardSize -1){
            for(uint8 i = 0; i < boardSize; i++){
                if(board[i][boardSize - 1 - i] != activePlayer){
                    break;
                }
                // win
                
                if(i == boardSize -1){
                    setWinner(activePlayer);
                    return;
                }
            }
        }
        // draw
        
        if(movesCounter == boardSize **2){
            setDraw();
            return;
        }
        if(activePlayer == player2){
            activePlayer = player1;
            
        }else{
            activePlayer = player2;
        }

        emit NextPlayer(activePlayer);
    }
}