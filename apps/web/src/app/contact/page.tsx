import { Mail, MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact Desk | Global Chanakya",
  description: "Contact the Global Chanakya intelligence desk.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
            Secure Communications
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">Contact <span className="text-[var(--text)]">Desk</span></h1>
          <p className="text-white/80 max-w-xl text-lg md:text-xl font-medium leading-[1.7]">
            Reach out to our editorial board, report tips, or contact our support team. All communications are strictly confidential.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-1 flex flex-col gap-10">
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)] bg-[var(--surface)]/30 hover:border-[var(--accent)] transition-colors group">
              <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-5">General Support</h3>
              <div className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 rounded-sm bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] shrink-0 group-hover:border-[var(--border)] transition-colors">
                  <Mail className="w-5 h-5 text-[var(--cyan)]" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-bold text-base break-all">editorglobalchanakya.com@gmail.com</p>
                  <p className="text-sm text-white/60 mt-1">For all queries, pitches and support</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)] bg-[var(--surface)]/30 hover:border-[var(--accent)] transition-colors group">
              <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-5">Headquarters</h3>
              <div className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 rounded-sm bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] shrink-0 group-hover:border-emerald-500/50 transition-colors">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-bold text-base">Global Chanakya Desk</p>
                  <p className="text-sm text-white/80 mt-1">New Delhi, India</p>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-white/50 mt-2">Virtual operations worldwide.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-8 md:p-12 rounded-lg bg-[var(--surface)]/50 relative overflow-hidden">
              {/* Subtle Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cyan)]/5 blur-[100px] rounded-full pointer-events-none" />
              
              <h3 className="font-heading text-2xl font-bold text-white mb-8 relative z-10 tracking-tight">Send a Secure Message</h3>
              
              <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6 relative z-10">
                <input type="hidden" name="access_key" value="e723b223-d3dc-4b8b-b284-c93a5e0d999b" />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-3">Name</label>
                    <input name="name" required type="text" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-5 py-4 text-white focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] outline-none transition-all placeholder:text-white/20" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-3">Email</label>
                    <input name="email" required type="email" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-5 py-4 text-white focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] outline-none transition-all placeholder:text-white/20" placeholder="you@domain.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-3">Subject</label>
                  <select name="subject" required className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-5 py-4 text-white focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] outline-none appearance-none transition-all">
                    <option value="Editorial Tip">Editorial Tip</option>
                    <option value="Reader Support">Reader Support</option>
                    <option value="Partnership Inquiry">Partnership Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-3">Message</label>
                  <textarea name="message" required rows={5} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-5 py-4 text-white focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] outline-none resize-none transition-all placeholder:text-white/20" placeholder="How can we help?"></textarea>
                </div>

                {/* Disable FormSubmit captcha if you prefer a seamless submission */}
                {/* <input type="hidden" name="_captcha" value="false" /> */}

                <div className="pt-4">
                  <button type="submit" className="w-full md:w-auto px-8 py-4 bg-[var(--gold)] text-[var(--bg)] text-sm font-extrabold uppercase tracking-[0.06em] rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
                    Send Dispatch <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
