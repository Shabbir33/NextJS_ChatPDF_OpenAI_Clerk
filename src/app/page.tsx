import FileUpload from "@/components/FileUpload";
import SubscriptionButton from "@/components/SubscriptionButton";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  const isPro = await checkSubscription();

  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-sky-100 to-indigo-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col md:flex-row items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            {/* After wards check for below deprecated attribute */}
            <span className="mt-3 md:mt-2">
              <UserButton afterSignOutUrl="/" />
            </span>
          </div>

          <div className="flex mt-2">
            {isAuthenticated && firstChat && (
              <div className="ml-3">
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <SubscriptionButton isPro={isPro} />
              </div>
            )}
          </div>
          <p className="max-w-xl mt-1 text-lg text-slate-800">
            Transform the way you interact with PDFs using our AI-powered chat.
            Quickly extract, summarize, and manage your documents with ease.
          </p>

          <div className="w-full mt-4">
            {isAuthenticated ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started! <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
