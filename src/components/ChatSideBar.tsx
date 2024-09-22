"use client";

import { chats, DrizzleChat } from "@/lib/db/schema";
import { Key, MessageCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import PayButton from "./PayButton";
import { NextResponse } from "next/server";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";
// import Razorpay from "razorpay";

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

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  async function displayRazorpay() {
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
  }

  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          <Link href="#">Source</Link>
        </div>
        {/* Stripe Button */}
        {/* <PayButton displayRazorpay={displayRazorpay} /> */}
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default ChatSideBar;
