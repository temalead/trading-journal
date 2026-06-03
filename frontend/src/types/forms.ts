import { DealResult, DealSession } from "../api/deals";

export type Page = "deals" | "pairs";

export type DealFormState = {
  tickerPairId: string;
  imageFiles: File[];
  currency: string;
  deposit: string;
  riskReward: string;
  result: DealResult;
  session: DealSession;
  links: DealLinkFormState[];
  description: string;
};

export type DealLinkFormState = {
  title: string;
  url: string;
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
  riskReward: "2.00R",
  result: "PROFIT",
  session: "london",
  links: [{ title: "", url: "" }],
  description: "",
};

export const initialPairForm: PairFormState = {
  pairName: "",
  icon: "",
};
