import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { ReadingHistory } from "@/lib/models/ReadingHistory";
import { Bookmark } from "@/lib/models/Bookmark";
import { Comment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Like";
import { DeviceSession } from "@/lib/models/DeviceSession";
import { Notification } from "@/lib/models/Notification";
import { PushSubscription } from "@/lib/models/PushSubscription";
import { Subscription } from "@/lib/models/Subscription";
import { Watchlist } from "@/lib/models/Watchlist";
import { AuditLog } from "@/lib/models/AuditLog";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    await dbConnect();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of admin accounts via this automated route
    if (user.role === "admin" || user.role === "super_admin") {
      return NextResponse.json({ error: "Admin accounts cannot be deleted via this endpoint. Contact support." }, { status: 403 });
    }

    // Audit log before deletion
    await AuditLog.create({
      userId,
      action: "DELETE_ACCOUNT",
      entityType: "User",
      entityId: userId,
      timestamp: new Date()
    });

    // Cascade Delete
    await Promise.all([
      ReadingHistory.deleteMany({ user: userId }),
      Bookmark.deleteMany({ userId }),
      Comment.deleteMany({ user: userId }),
      Like.deleteMany({ user: userId }),
      DeviceSession.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      PushSubscription.deleteMany({ userId }),
      Subscription.deleteMany({ userId }),
      Watchlist.deleteMany({ userId }),
      // Delete the user themselves
      User.findByIdAndDelete(userId)
    ]);

    // We do NOT log out the user here. The client side should handle signOut() from next-auth.
    return NextResponse.json({ success: true, message: "Account and associated data deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
