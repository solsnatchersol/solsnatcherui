import styled from "styled-components";
import Button from "@mui/material/Button";
import { CandyMachineAccount } from "./candy-machine";
import { CircularProgress } from "@mui/material";
import { GatewayStatus, useGateway } from "@civic/solana-gateway-react";
import { useEffect, useState, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  findGatewayToken,
  getGatewayTokenAddressForOwnerAndGatekeeperNetwork,
  onGatewayTokenChange,
  removeAccountChangeListener,
} from "@identity.com/solana-gateway-ts";
import { CIVIC_GATEKEEPER_NETWORK } from "./utils";

export const CTAButton = styled(Button)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

export const MintButton = ({
  onMint,
  candyMachine,
  isMinting,
  setIsMinting,
  isActive,
}: {
  onMint: () => Promise<void>;
  candyMachine?: CandyMachineAccount;
  isMinting: boolean;
  setIsMinting: (val: boolean) => void;
  isActive: boolean;
}) => {
  const wallet = useWallet();
  const connection = useConnection();
  const [verified, setVerified] = useState(false);
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [webSocketSubscriptionId, setWebSocketSubscriptionId] = useState(-1);
  const [clicked, setClicked] = useState(false);
  const [waitForActiveToken, setWaitForActiveToken] = useState(false);

  const getMintButtonContent = () => {
    if (candyMachine?.state.isSoldOut) {
      console.log("Candy Machine is sold out.");
      return "SOLD OUT";
    } else if (isMinting) {
      console.log("Minting in progress.");
      return <CircularProgress />;
    } else if (
      candyMachine?.state.isPresale ||
      candyMachine?.state.isWhitelistOnly
    ) {
      console.log("Minting is in presale or whitelist-only mode.");
      return "WHITELIST MINT";
    }
    console.log("Button should be active.");
    return "MINT";
  };

  useEffect(() => {
    console.log(`isActive: ${isActive}, isMinting: ${isMinting}, verified: ${verified}, gatewayStatus: ${gatewayStatus}`);
    if (!isActive || isMinting || !verified || gatewayStatus !== GatewayStatus.ACTIVE) {
      console.log("Mint button is disabled due to one or more conditions.");
      return;
    }
    console.log("Mint button is enabled.");
  }, [isActive, isMinting, verified, gatewayStatus]);

  return (
    <CTAButton
      onClick={async () => {
        console.log("Mint button clicked.");
        setIsMinting(true);
        try {
          await onMint();
          setIsMinting(false);
        } catch (error) {
          console.error("Error during minting: ", error);
          setIsMinting(false);
        }
      }}
      disabled={!isActive || isMinting || !verified || gatewayStatus !== GatewayStatus.ACTIVE}
    >
      {getMintButtonContent()}
    </CTAButton>
  );
};

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
