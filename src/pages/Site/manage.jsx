import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSiteContent, defaultSiteContent } from "@/data/site-content";
import {
  Globe,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
  Megaphone,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function SiteManagePage() {
  const [content, setContent] = useSiteContent();
  const update = (patch) => setContent({ ...content, ...patch });
  const save = () => {
    setContent(content);
    toast.success("Website content saved");
  };
  const reset = () => {
    setContent(defaultSiteContent);
    toast.success("Reset to defaults");
  };
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Website CMS"
        title="Site Manage"
        description="Edit the public school website content live — hero, stats, promise, contact and footer."
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/site">
                <Eye className="h-4 w-4" /> Preview Site
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
              onClick={save}
            >
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { icon: Globe, l: "Public Pages", v: "6" },
          { icon: Sparkles, l: "Hero Sections", v: "1" },
          { icon: BarChart3, l: "Stat Counters", v: String(content.stats.length) },
          { icon: Megaphone, l: "Promise Bullets", v: String(content.promise.bullets.length) },
        ].map((s) => (
          <Card key={s.l} className="p-5 shadow-card flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-elegant">
        <Tabs defaultValue="brand">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="promise">Promise</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="pt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Brand name"
              value={content.brand.name}
              onChange={(v) => update({ brand: { ...content.brand, name: v } })}
            />
            <Field
              label="Tagline"
              value={content.brand.sub}
              onChange={(v) => update({ brand: { ...content.brand, sub: v } })}
            />
          </TabsContent>

          <TabsContent value="hero" className="pt-6 grid gap-4">
            <Field
              label="Top badge"
              value={content.hero.badge}
              onChange={(v) => update({ hero: { ...content.hero, badge: v } })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Title (line 1)"
                value={content.hero.title}
                onChange={(v) => update({ hero: { ...content.hero, title: v } })}
              />
              <Field
                label="Title accent (line 2)"
                value={content.hero.titleAccent}
                onChange={(v) => update({ hero: { ...content.hero, titleAccent: v } })}
              />
            </div>
            <FieldArea
              label="Subtitle"
              value={content.hero.subtitle}
              onChange={(v) => update({ hero: { ...content.hero, subtitle: v } })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Primary CTA"
                value={content.hero.primaryCta}
                onChange={(v) => update({ hero: { ...content.hero, primaryCta: v } })}
              />
              <Field
                label="Secondary CTA"
                value={content.hero.secondaryCta}
                onChange={(v) => update({ hero: { ...content.hero, secondaryCta: v } })}
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="pt-6 space-y-3">
            {content.stats.map((s, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[1fr,2fr,auto] items-end">
                <Field
                  label={`Value ${i + 1}`}
                  value={s.v}
                  onChange={(v) => {
                    const next = [...content.stats];
                    next[i] = { ...s, v };
                    update({ stats: next });
                  }}
                />
                <Field
                  label="Label"
                  value={s.l}
                  onChange={(v) => {
                    const next = [...content.stats];
                    next[i] = { ...s, l: v };
                    update({ stats: next });
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => update({ stats: content.stats.filter((_, x) => x !== i) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => update({ stats: [...content.stats, { v: "0", l: "New Stat" }] })}
            >
              <Plus className="h-4 w-4" /> Add Stat
            </Button>
          </TabsContent>

          <TabsContent value="promise" className="pt-6 grid gap-4">
            <Field
              label="Eyebrow"
              value={content.promise.eyebrow}
              onChange={(v) => update({ promise: { ...content.promise, eyebrow: v } })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                value={content.promise.title}
                onChange={(v) => update({ promise: { ...content.promise, title: v } })}
              />
              <Field
                label="Title accent"
                value={content.promise.titleAccent}
                onChange={(v) => update({ promise: { ...content.promise, titleAccent: v } })}
              />
            </div>
            <FieldArea
              label="Description"
              value={content.promise.description}
              onChange={(v) => update({ promise: { ...content.promise, description: v } })}
            />
            <Separator />
            <Label className="text-sm font-semibold">Bullet points</Label>
            {content.promise.bullets.map((b, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={b}
                  onChange={(e) => {
                    const next = [...content.promise.bullets];
                    next[i] = e.target.value;
                    update({ promise: { ...content.promise, bullets: next } });
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    update({
                      promise: {
                        ...content.promise,
                        bullets: content.promise.bullets.filter((_, x) => x !== i),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="gap-2 w-fit"
              onClick={() =>
                update({
                  promise: {
                    ...content.promise,
                    bullets: [...content.promise.bullets, "New highlight"],
                  },
                })
              }
            >
              <Plus className="h-4 w-4" /> Add Bullet
            </Button>
          </TabsContent>

          <TabsContent value="contact" className="pt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Address"
              value={content.contact.address}
              onChange={(v) => update({ contact: { ...content.contact, address: v } })}
            />
            <Field
              label="Phone"
              value={content.contact.phone}
              onChange={(v) => update({ contact: { ...content.contact, phone: v } })}
            />
            <Field
              label="Email"
              value={content.contact.email}
              onChange={(v) => update({ contact: { ...content.contact, email: v } })}
            />
            <Field
              label="Office Hours"
              value={content.contact.hours}
              onChange={(v) => update({ contact: { ...content.contact, hours: v } })}
            />
          </TabsContent>

          <TabsContent value="footer" className="pt-6 grid gap-4">
            <FieldArea
              label="Footer tagline"
              value={content.footer.tagline}
              onChange={(v) => update({ footer: { ...content.footer, tagline: v } })}
            />
            <Card className="p-4 bg-accent/30 border-dashed flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                Footer contact info auto-syncs with the Contact tab.
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
function Field({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function FieldArea({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default SiteManagePage;
