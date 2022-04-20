import {Fragment,useEffect, useState} from "react";
import './App.css';
import contract from "./contracts/NFTCollectible.json";
import {ethers} from "ethers";
// import { Fragment } from 'react/cjs/react.production.min';
import Footer from './components/Footer';
import Header from './components/Header';
import squirrelImg from './assets/test.png';

const OPENSEA_LINK = 'https://testnets.opensea.io/collection/rinkeby-squirrels';
const contractAddress ="0xF9483273f0C81924B262ad771E5B429Fc74eF658";
const abi = contract.abi;

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [metamaskError, setMetamaskError] = useState(null);
  const [mineStatus, setMineStatus] = useState(null);

  //metamaskチェック
  const checkWalletIsConnected = async () => {
    const {ethereum} = window;

    if(!ethereum){
      console.log("Make sure you have MataMask installed!");
      return;
    }else{
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts"});
    const network = await ethereum.request({ method: 'eth_chainId'});

    if (accounts.length !== 0 && network.toString() === '0x13881'){
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setMetamaskError(false);
      setCurrentAccount(account);
    }else{
      setMetamaskError(true);
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    console.log("push button")
    const {ethereum} = window;

    if(!ethereum){
      alert("Please install Metaask!");
    }

    try{
      console.log("network request")
      const network = await ethereum.request({method: 'eth_chainId'});

      if(network.toString() !== '0x13881'){
        console.log("network notpolygon")
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
      console.log("Found an account! Address: ", accounts[0]);
      setMetamaskError(null);
      setCurrentAccount(accounts[0]);
      }else{
        console.log("connected")
        setMetamaskError(true);
      }

    }catch(error){
      console.log(error);
    }
  };

  // Mint
  const mintNftHandler = async () => {
    try{

      setMineStatus('mining');

      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1,{
          gasLimit: 160000, value: ethers.utils.parseEther("0.01"),
        });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: ${nftTxn.hash}`);
        setMineStatus('success');
      }else{
        setMineStatus('error');
        console.log("Ethereum object does not exist");
      }
    }catch(error){
      setMineStatus('error');
      console.log(error);
    }
  };

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    )
  }
  const mintNftButton = () =>{
    return(
      <button onClick={mintNftHandler} className="cta-button connect-wallet-button">
        Mint a Polygon Squirrel NFT
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  })

  return (
    <Fragment>
      {metamaskError && <div className='metamask-error'>MetamaskからPolygon Testnetに接続してください!</div>}
      <div className ="App">
        <div className="container">
          <Header opensea={OPENSEA_LINK}/>
          <div className="header-container">
            <div className='banner-img'>
              <img src={squirrelImg} alt="Polyon Squirrels"></img>
            </div>
            {currentAccount && mineStatus !== 'mining' && mintNftButton()}
            {!currentAccount && !mineStatus && connectWalletButton()}
            <div className='mine-submission'>
              {mineStatus === 'success' && <div className={mineStatus}>
                <p>NFT minting successful!</p>
                <p className='success-link'>
                  <a href={`https://testnets.opensea.io/${currentAccount}/`}
                  target='_blank' rel="noreferer">Click here</a>
                  <span> to view your NFT on OpenSea.</span>
                </p>
              </div>}
              {mineStatus === 'mining' && <div className={mineStatus}>
                <div className="loader"/>
                <span>Transaction is mining... waiting for..</span>
                </div>}
              {mineStatus === 'error' && <div className={mineStatus}>
                <p>Transaction failed. Make sure you have at least 0.01 MATIC in your Metamask wallet and try again.</p>
                </div>}
            </div>
          </div>
          {currentAccount && <div className="show-user-address">
            <p>Your address being connected: &nbsp;<br/>
              <span><a className="user-address" target="_blank" rel="noreferrer">
                {currentAccount}
                </a></span>
            </p>
          </div>}
        </div>
        <Footer address={contractAddress}/>
      </div>
    </Fragment>
  );
}

export default App;
