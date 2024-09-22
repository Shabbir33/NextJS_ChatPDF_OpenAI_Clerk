"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { NextResponse } from "next/server";

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      reject(false);
    };
  });
}

type Props = { isPro: boolean };

const SubscriptionButton = ({ isPro }: Props) => {
  // Add Loading Logic to Button
  const [loading, setLoading] = useState(false);
  const handleSubcription = async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const { order } = await axios
      .get("http://localhost:3000/api/razorpay")
      .then((t) => t.data);

    console.log(order);

    const options = {
      key: "rzp_test_HshGpdEbxOEGa0",
      currency: order.currency,
      amount: order.amount.toString(),
      order_id: order.id,
      name: "Donation",
      description: "Thank you for nothing. Please give us some money",
      // image: "http://localhost:1337/logo.svg",
      handler: function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature);
      },
      prefill: {
        email: "sdfdsjfh2@ndsfdf.com",
        phone_number: "9899999999",
      },
    };

    try {
      if (typeof window !== "undefined") {
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      }
    } catch (error) {
      return NextResponse.json({ error });
    }
  };
  return (
    <Button disabled={loading || isPro} onClick={handleSubcription}>
      {isPro ? "You are Pro!!" : "Get Pro"}
    </Button>
  );
};

export default SubscriptionButton;
