import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FeedService } from "@/modules/feed/services/feed.service";
import { WatchlistService } from "@/modules/watchlist/services/watchlist.service";
import { BookmarkService } from "@/modules/bookmark/services/bookmark.service";
import { NotificationService } from "@/modules/notification/services/notification.service";
import { Shield, Bookmark as BookmarkIcon, Bell, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TimelineView } from "@/components/ui/TimelineView";

export const revalidate = 60; // 1 min cache

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  // Fetch all dashboard data in parallel
  const [feed, watchlist, bookmarks, unreadCount] = await Promise.all([
    FeedService.getPersonalizedFeed(userId, 15),
    WatchlistService.getUserWatchlist(userId),
    BookmarkService.getUserBookmarks(userId),
    NotificationService.getUnreadCount(userId),
  ]);

  return (
    <div className="bg-[#060606] text-white min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <div className="p-6 rounded-sm bg-white/[0.02] border border-white/[0.06] mb-6">
            <h2 className="text-xl font-bold mb-1">{session.user.name}</h2>
            <p className="text-sm text-neutral-500">{session.user.email}</p>
          </div>

          <nav className="flex flex-col gap-1">
            <a href="#feed" className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Activity Feed</span>
            </a>
            <a href="#watchlist" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] text-neutral-400 hover:text-white transition-colors">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Watchlist</span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{watchlist.length}</span>
            </a>
            <a href="#bookmarks" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] text-neutral-400 hover:text-white transition-colors">
              <span className="flex items-center gap-2"><BookmarkIcon className="w-4 h-4" /> Saved Reports</span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{bookmarks.length}</span>
            </a>
            <a href="#notifications" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] text-neutral-400 hover:text-white transition-colors">
              <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</span>
              {unreadCount > 0 && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </a>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* Personalized Feed Section */}
          <section id="feed" className="scroll-mt-32">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" /> Personalized Feed
            </h3>
            
            {feed.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-sm bg-white/[0.01]">
                <p className="text-neutral-500 mb-2">Your feed is empty.</p>
                <p className="text-sm text-neutral-600">Follow countries and conflicts to generate personalized intelligence.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map((item) => (
                  <div key={item.id} className="p-5 rounded-sm border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group relative overflow-hidden">
                    { (item.meta as any)?.severity === "critical" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 bg-white/5 px-2 py-1 rounded">
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{item.description}</p>
                    
                    <Link href={item.type === "blog" ? `/blog/${item.id}` : `#`} className="inline-flex items-center gap-1 text-sm text-blue-400 font-medium group-hover:text-blue-300">
                      Read full brief <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Watchlist Summary */}
          <section id="watchlist" className="scroll-mt-32">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" /> Tracked Entities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {watchlist.map((w) => (
                <div key={w._id as unknown as string} className="p-4 rounded-sm border border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 uppercase">{w.entityType}</span>
                    {/* Real app would populate entity name here */}
                    <div className="font-medium text-white truncate w-32">ID: {w.entityId.toString().slice(-6)}</div> 
                  </div>
                </div>
              ))}
              {watchlist.length === 0 && (
                <div className="col-span-full p-4 text-sm text-neutral-500">You are not following any entities yet.</div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
