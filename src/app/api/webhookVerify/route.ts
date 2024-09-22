import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

// Helper function to get raw body
async function getRawBody(req: Request) {
  const reader = req.body?.getReader();
  const decoder = new TextDecoder();
  let rawBody = "";
  while (true) {
    const { done, value } = await reader?.read()!;
    if (done) break;
    rawBody += decoder.decode(value, { stream: true });
  }
  return rawBody;
}

export async function POST(req: Request, res: Response) {
  // Capture raw body
  const rawBody = await getRawBody(req);
  console.log(rawBody);
  const data = JSON.parse(rawBody);

  const razorpay_order_id = data.payload.payment.entity.order_id;
  const razorpay_payment_id = data.payload.payment.entity.id;
  const razorpay_signature = req.headers.get("x-razorpay-signature");
  const userId = data.payload.payment.entity.notes.userId;

  // const body = razorpay_order_id + "|" + razorpay_payment_id;
  // console.log("id==", body);

  // const expectedSignature = crypto
  //   .createHmac("sha256", "123456")
  //   .update(body.toString())
  //   .digest("hex");

  // console.log(expectedSignature, " | ", razorpay_signature);
  const isAuthentic = validateWebhookSignature(
    rawBody,
    razorpay_signature!,
    "12345678"
  );

  console.log(isAuthentic);

  if (isAuthentic) {
    // Check if already registered

    // Add the record to the database
    await db.insert(userSubscriptions).values({
      userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    console.log("Payment Verified and Added to Database.");
    //  return NextResponse.redirect(new URL('/paymentsuccess', req.url));
  } else {
    return NextResponse.json(
      {
        message: "fail",
      },
      {
        status: 400,
      }
    );
  }

  // Necessary to return 200 as success for the webhook to return
  return NextResponse.json(
    {
      message: "success",
    },
    {
      status: 200,
    }
  );
}
