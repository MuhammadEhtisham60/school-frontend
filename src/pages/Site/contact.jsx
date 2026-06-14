import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent } from "@/data/site-content";

function ContactPage() {
  const [content] = useSiteContent();
  return (
    <div>
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Contact
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Let's talk.</h1>
          <p className="mt-4 max-w-2xl text-white/85">
            We'd love to show you around. Book a campus tour or send us a message.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid lg:grid-cols-3 gap-8">
        <div className="space-y-4 lg:col-span-1">
          {[
            { icon: MapPin, t: "Visit", d: content.contact.address },
            { icon: Phone, t: "Call", d: content.contact.phone },
            { icon: Mail, t: "Email", d: content.contact.email },
            { icon: Clock, t: "Office Hours", d: content.contact.hours },
          ].map((c) => (
            <Card key={c.t} className="p-5 shadow-card flex gap-4 items-start card-hover">
              <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">{c.t}</div>
                <div className="text-sm text-muted-foreground">{c.d}</div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-7 shadow-elegant lg:col-span-2">
          <h3 className="text-xl font-bold">Send us a message</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thanks! We'll be in touch within 24 hours.");
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@email.com" required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+92 ..." />
            </div>
            <div className="space-y-2">
              <Label>Interested in grade</Label>
              <Input placeholder="e.g. Grade 5" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Message</Label>
              <Textarea rows={5} placeholder="How can we help?" />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0 shadow-glow w-full sm:w-auto"
              >
                Send Message
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}

export default ContactPage;
