import webpush from 'web-push';
import { PushSubscription } from '@/lib/models/PushSubscription';
import { NotificationEvent } from '@/lib/models/NotificationEvent';
export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
  type?: string;
  eventId?: string;
}

// Load VAPID details from environment
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@globalchanakya.in';

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('[PushService] VAPID keys are not configured. Push notifications will be disabled.');
} else {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * PushService handles bounded delivery of Web Push notifications.
 * It respects a caller‑provided deadline (ms since epoch) and never throws
 * errors that would affect the primary business operation.
 */
export class PushService {
  /** Batch size for subscription queries – keeps memory usage low. */
  private static readonly BATCH_SIZE = 200;

  /** Default execution budget if caller does not specify one (ms). */
  private static readonly DEFAULT_BUDGET_MS = 3000;

  /** Send a generic notification payload to all matching subscriptions. */
  static async send(
    payload: NotificationPayload,
    options: { deadlineMs?: number; type: 'INTELLIGENCE' | 'BLOG' | 'PLATFORM' }
  ): Promise<void> {
    const deadline = options.deadlineMs ?? Date.now() + PushService.DEFAULT_BUDGET_MS;
    const { type } = options;
    const eventId = payload.eventId; // stringified source document id
    if (!eventId) {
      console.error('[PushService] Missing eventId in payload');
      return;
    }

    // 1️⃣ Acquire or create a NotificationEvent lock (idempotent)
    const existing = await NotificationEvent.findOne({
      eventType: type,
      eventId,
      notificationType: type,
    });
    if (existing?.status === 'SENT') {
      // Already delivered – nothing to do.
      return;
    }

    const lock = await NotificationEvent.findOneAndUpdate(
      {
        eventType: type,
        eventId,
        notificationType: type,
        status: { $in: ['PENDING', 'FAILED'] },
      },
      { $set: { status: 'PENDING' }, $inc: { attempts: 1 }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );

    // 2️⃣ Dispatch to subscriptions within the deadline
    let skip = 0;
    while (Date.now() < deadline) {
      const subs = await PushSubscription.find({
        active: true,
        [`preferences.${type.toLowerCase()}`]: true,
      })
        .skip(skip)
        .limit(PushService.BATCH_SIZE);

      if (subs.length === 0) {
        break;
      }

      for (const sub of subs) {
        if (Date.now() >= deadline) break;
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
          await sub.updateOne({ lastSuccessAt: new Date() });
        } catch (err: any) {
          // 404/410 indicates the subscription is no longer valid
          if (err.statusCode === 404 || err.statusCode === 410) {
            await sub.updateOne({ active: false, lastFailureAt: new Date() });
          } else {
            await sub.updateOne({ lastFailureAt: new Date() });
          }
        }
      }

      if (subs.length < PushService.BATCH_SIZE) {
        break; // no more records
      }
      skip += PushService.BATCH_SIZE;
    }

    // 3️⃣ Record final status – if we exited due to time, keep as FAILED for retry
    if (Date.now() >= deadline) {
      await NotificationEvent.updateOne({ _id: lock._id }, { $set: { status: 'FAILED', lastError: 'Deadline exceeded' } });
    } else {
      await NotificationEvent.updateOne({ _id: lock._id }, { $set: { status: 'SENT', sentAt: new Date() } });
    }
  }

  /** Convenience wrappers for each notification type */
  static async notifyIntelligence(eventDoc: any, deadlineMs?: number): Promise<void> {
    const payload = {
      eventId: eventDoc._id.toString(),
      title: `New Intelligence – ${eventDoc.title}`,
      body: eventDoc.summary?.slice(0, 120) ?? 'A new intelligence report has been published.',
      url: `/blogs/${eventDoc.slug}`,
      icon: '/favicon.svg', // fallback – will be replaced by a real icon if available
      type: 'INTELLIGENCE',
    } as NotificationPayload;
    await PushService.send(payload, { deadlineMs, type: 'INTELLIGENCE' });
  }

  static async notifyBlog(blogDoc: any, deadlineMs?: number): Promise<void> {
    const payload = {
      eventId: blogDoc._id.toString(),
      title: `New Blog – ${blogDoc.title}`,
      body: blogDoc.excerpt?.slice(0, 120) ?? 'A new blog post has been published.',
      url: `/blogs/${blogDoc.slug}`,
      icon: '/favicon.svg',
      type: 'BLOG',
    } as NotificationPayload;
    await PushService.send(payload, { deadlineMs, type: 'BLOG' });
  }

  static async notifyPlatform(data: { title: string; message: string; url: string }, deadlineMs?: number): Promise<void> {
    const payload = {
      eventId: `${Date.now()}`,
      title: data.title,
      body: data.message,
      url: data.url,
      icon: '/favicon.svg',
      type: 'PLATFORM',
    } as NotificationPayload;
    await PushService.send(payload, { deadlineMs, type: 'PLATFORM' });
  }
}

export default PushService;
