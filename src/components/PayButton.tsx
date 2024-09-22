"use client";
import React from "react";
import { Button } from "./ui/button";

type Props = {
  displayRazorpay: () => void;
};

const PayButton = ({ displayRazorpay }: Props) => {
  return (
    <Button className="mt-2 text-white bg-slate-700" onClick={displayRazorpay}>
      Upgrade to Pro!
    </Button>
  );
};

export default PayButton;
