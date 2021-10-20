import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'Kimmo47620195';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x22fc3174614aE3e4E9972C27afaC7e94Edf61237";

const App = () => {


    /*
    * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
    */
    const [currentAccount, setCurrentAccount] = useState("");
    const [isRendering, setIsRendering] = useState(false);
    const [mintingMessage, setMintingMessage] = useState("");
    const [currentAmount, setCurrentAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);  
    /*
    * Gotta make sure this is async.
    */
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
      /*
      * User can have multiple authorized accounts, we grab the first one if its there!
      */
      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          getCurrentAmount();
          setCurrentAccount(account);
          // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          
      } else {
          console.log("No authorized account found")
      }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()  
    } catch (error) {
      console.log(error)
    }
  }
// Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
const askContractToMintNft = async () => {
    try {
      setIsRendering(true);
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        setMintingMessage("Going to pop wallet now to pay gas...")
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        setMintingMessage("Mining...please wait😴.")
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        setMintingMessage("Minted🚀")
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setupEventListener();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsRendering(false);
}}
async function getCurrentAmount() {
    console.log("callled getCurrentAmount()")
    try {
      console.log("called getCurrentAmount()")
      const {ethereum} = window;
      if (ethereum) {
        // ethers is a library that helps our frontend talk to our contract make sure to import
        // A provers is what we use to talk to Ethereum nodes.
        const provider = new ethers.providers.Web3Provider(ethereum);
        // A signer is an abstraction of an Eth account that is used to sign & send transactions to the Eth Network to execute state changing operations
        // const signer = provider.getSigner();
        // Find the total number of Gms without being signed in -- pass in provider instead of signer
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);

        // Find the total number of Gms without being signed in

        let totalCount = await connectedContract.totalNumber();
        let currentCount = await connectedContract.currentNumber();
        console.log(`${currentCount.toNumber()}/ ${totalCount.toNumber()}`);
      setCurrentAmount(currentCount.toNumber());
      setTotalAmount(totalCount.toNumber());
      }} catch (error) {
      console.log(error);
      }}
// TODO 
// when minted add https://testnets.opensea.io/assets/INSERT_CONTRACT_ADDRESS_HERE/INSERT_TOKEN_ID_HERE
// https://rinkeby.rarible.com/token/INSERT_CONTRACT_ADDRESS_HERE:INSERT_TOKEN_ID_HERE





  useEffect(() => {
    checkIfWalletIsConnected();
    getCurrentAmount();
    
  }, [currentAmount,totalAmount])
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today. {currentAmount} / {totalAmount} minted.
          </p>
          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          ) : [isRendering ? (
          <button onClick={null} className="cta-button connect-wallet-button">
              {mintingMessage}
            </button>
        ):(
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
        )
        ] 
          }



        </div>

        <div className="footer-container">
        <a target="_blank" rel="noopener noreferrer" href="https://testnets.opensea.io/collection/squarenft-pmg8wrec1o">
        <button onClick={null} className="cta-button connect-wallet-button">
              🌊 View Collection on OpenSea
        </button></a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
