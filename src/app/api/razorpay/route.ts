// Route - /api/razorpay

import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { razorpay } from "@/lib/razorpay";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import shortid from "shortid";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID!,
  key_secret: process.env.RAZORPAY_KEY,
});

export async function GET(req: Request) {
  console.log("Called");
  try {
    const { userId } = await auth();
    // const user = await currentUser();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // If already registered then do not create a new order and return to the home page with a toast notification.

    // const _userSubscriptions = await db
    //   .select()
    //   .from(userSubscriptions)
    //   .where(eq(userSubscriptions.userId, userId));

    // if (_userSubscriptions[0] && _userSubscriptions[0].razorpayPaymentId) {
    //   console.log("Called");
    //   return NextResponse.json({ msg: "Already paid!" });
    // }

    // User's first time trying to subscribe
    const payment_capture = 1;
    const amount = 250 * 100; // amount in paisa. In our case it's INR 1
    const currency = "INR";
    const options = {
      amount: amount.toString(),
      currency,
      receipt: shortid.generate(),
      payment_capture,
      notes: {
        // These notes will be added to your transaction. So you can search it within their dashboard.
        // Also, it's included in webhooks as well. So you can automate it.
        paymentFor: "testingDemo",
        userId: userId,
        productId: "P100",
      },
    };

    const order = await instance.orders.create(options);

    console.log("Order created!");

    return NextResponse.json({ msg: "success", order });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error!" + error },
      { status: 500 }
    );
  }
}
