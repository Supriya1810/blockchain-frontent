import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

window.ethereum;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
  // console.log({ provider, signer, transactionContract });
};

export const TransactionProvider = ({ children }) => {
  var initialState = {};
  const [connectedAccount, setConnectedAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    meassage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transaction, setTransaction] = useState([]);

  const handleChange = (e, name) => {
    // setFormData({
    // ...formData,
    // [e.target.name]: e.target.value,
    // });
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Plz install meatamask");
      const transactionContract = getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structTransaction = availableTransactions.map((transaction) => ({
        addressTo: transaction.recevier,
        addressFrom: transaction.sender,
        timestamp: new Date(
          transaction.timestamp.toNumber() * 100
        ).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) * 10 ** 18,
      }));
      setTransaction(structTransaction);
      console.log(availableTransactions);
    } catch (error) {
      console.log(error);
    }
  };
  const checkIfWalleIsConnected = async () => {
    try {
      if (!ethereum) return alert("Plz install meatamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setConnectedAccount(accounts[0]);
        getAllTransactions();
        // getAllTransaction();
      } else {
        console.log("NO account found");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Plz install meatamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setConnectedAccount(accounts[0]);
    } catch (err) {
      console.log(err);
      throw new Error("No ehhereum");
    }
  };

  const checkIfTransactionsExit = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();
      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (err) {
      console.log(err);
      throw new Error("No ethereum ogj");
    }
  };

  const sendTransaction = async () => {
    // try {
    //   if (!ethereum) return alert("Plz install meatamask");
    //   const { addressTo, amount, keyword, message } = formData;
    //   const transactionContract = getEthereumContract();
    //   const parsedAmount = ethers.utils.parseEther(amount);

    //   await ethereum.request({
    //     method: "eth_sendTransaction",
    //     params: [
    //       {
    //         from: connectedAccount,
    //         to: addressTo,
    //         gas: "0x5208", //21000 GWEI
    //         value: parsedAmount._hex, //0.0001
    //       },
    //     ],
    //   });
    //   console.log("before addToBlock");
    //   const transactionHash = await transactionContract.addToBlockChain(
    //     addressTo,
    //     parsedAmount,
    //     message,
    //     keyword
    //   );

    //   setIsLoading(true);
    //   console.log(`LOading,${transactionHash.hash}`);
    //   await transactionHash.wait();
    //   setIsLoading(false);
    //   console.log(`Success,${transactionHash.hash}`);

    //   const transactionCount = await transactionContract.getTransactionCount();
    //   setTransactionCount(transactionCount.toNumber());
    //   window.reload();
    //   //get the data from
    // } catch (err) {
    //   console.log(err);
    //   throw new Error("No ethereum ogj");
    // }

    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = getEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: connectedAccount,
              to: addressTo,
              gas: "0x5208",
              value: parsedAmount._hex,
            },
          ],
        });

        const transactionHash = await transactionsContract.addToBlockChain(
          addressTo,
          parsedAmount,
          message,
          keyword
        );

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount =
          await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalleIsConnected();
    checkIfTransactionsExit();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        connectedAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transaction,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
