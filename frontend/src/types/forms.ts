import { DealResult } from "../api/deals";

export type Page = "deals" | "pairs";

export type DealFormState = {
  tickerPairId: string;
  imageFiles: File[];
  currency: string;
  deposit: string;
  openPrice: string;
  closePrice: string;
  riskReward: string;
  result: DealResult;
  description: string;
};

export type PairFormState = {
  pairName: string;
  icon: string;
};

export type AuthFormState = {
  mode: "login" | "register";
  username: string;
  email: string;
  password: string;
};

export const initialDealForm: DealFormState = {
  tickerPairId: "",
  imageFiles: [],
  currency: "USD",
  deposit: "",
  openPrice: "",
  closePrice: "",
  riskReward: "2.00R",
  result: "PROFIT",
  description: "",
};

export const initialPairForm: PairFormState = {
  pairName: "",
  icon: "",
};
