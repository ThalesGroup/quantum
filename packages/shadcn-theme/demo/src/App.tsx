// The demo page: every shadcn/ui component of src/components/ui/ as the registry ships it, on the
// Quantum theme. Utilities here lay the page out (grids, gaps, widths); none restyles a
// component. The note under each heading is generated from ../../src/mapping.mjs, the same data
// the theme is built from, so it says which Quantum component each shadcn one stands for.
import * as React from "react"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BoldIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ItalicIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  TrashIcon,
  UnderlineIcon,
} from "lucide-react"

import { COMPONENTS, SHADCN_ONLY, STYLE, THEME, VARIABLES } from "../../src/mapping.mjs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/* ------------------------------------------------------------------ mapping notes */

type Config = {
  set?: Record<string, string | boolean>
  state?: string
  part?: string
  props: Record<string, unknown> | null
  note?: string
}
type Equivalence = { quantum: string; shadcn: string | null; configs: Config[]; shadcnOnly?: string[]; note?: string }
type Mapped = { token: string; reason?: string; modes?: string[]; fallback?: string }

const EQUIVALENCES = COMPONENTS as unknown as Equivalence[]
const VARS = VARIABLES as unknown as Record<string, Mapped>
const THEME_VARS = THEME as unknown as Record<string, Mapped>

/** "icon-button" -> "Icon button", as the specs name the components. */
const quantumName = (id: string) => id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ")

const describeQuantum = (c: Config) =>
  c.set
    ? Object.entries(c.set).map(([k, v]) => (typeof v === "boolean" ? `${k}` : `${k} ${v}`)).join(" + ")
    : c.state !== undefined
      ? `${c.state} state`
      : `${c.part} part`

const describeShadcn = (props: Record<string, unknown>) =>
  Object.entries(props)
    .map(([k, v]) => (k === "component" || k === "children" ? String(v) : `${k}=${typeof v === "string" ? `"${v}"` : String(v)}`))
    .join(" ")

/** One line per Quantum component: its equivalences, then what has none. */
function MappingNote({ ids }: { ids: string[] }) {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      {ids.map((id) => {
        const eq = EQUIVALENCES.find((e) => e.quantum === id)
        if (!eq) return null
        const mapped = eq.configs.filter((c) => c.props)
        const missing = eq.configs.filter((c) => !c.props)
        return (
          <p key={id}>
            <span className="font-medium text-foreground">Quantum {quantumName(id)}</span>
            {eq.shadcn ? <> = <code className="font-mono">{eq.shadcn}</code></> : " has no shadcn component"}
            {mapped.length > 0 && <>: {mapped.map((c) => `${describeQuantum(c)} = ${describeShadcn(c.props!)}`).join(" · ")}</>}
            {missing.length > 0 && <>. No equivalent: {missing.map(describeQuantum).join(", ")}</>}
            {eq.shadcnOnly?.length ? <>. shadcn only: {eq.shadcnOnly.join(", ")}</> : null}
            {eq.note ? <>. {eq.note}</> : null}.
          </p>
        )
      })}
    </div>
  )
}

function Section({ id, title, quantum, note, children }: { id: string; title: string; quantum?: string[]; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {quantum && <MappingNote ids={quantum} />}
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  )
}

const Row = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div className="flex flex-wrap items-center gap-3">
    {label && <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>}
    {children}
  </div>
)

/* ------------------------------------------------------------------ color scheme */

type Scheme = "light" | "dark" | "system"
const STORAGE_KEY = "quantum-shadcn-theme"

function useScheme(): [Scheme, (s: Scheme) => void] {
  const [scheme, setScheme] = React.useState<Scheme>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s === "light" || s === "dark" ? s : "system"
    } catch {
      return "system"
    }
  })
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => document.documentElement.classList.toggle("dark", scheme === "dark" || (scheme === "system" && media.matches))
    apply()
    try {
      localStorage.setItem(STORAGE_KEY, scheme)
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [scheme])
  return [scheme, setScheme]
}

const SECTIONS: [string, string][] = [
  ["variables", "Theme variables"],
  ["typography", "Typography"],
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["alerts", "Alerts"],
  ["cards", "Cards"],
  ["forms", "Form controls"],
  ["accordion", "Accordion"],
  ["navigation", "Breadcrumb and pagination"],
  ["feedback", "Progress, skeleton, spinner"],
  ["avatar", "Avatar"],
  ["separator", "Separator"],
  ["menus", "Dropdown menu"],
  ["dialog", "Dialog"],
  ["tabs", "Tabs"],
  ["table", "Table"],
  ["tooltip", "Tooltip"],
  ["toggles", "Toggles"],
]

function Toolbar({ scheme, setScheme }: { scheme: Scheme; setScheme: (s: Scheme) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="mr-auto">
          <p className="font-semibold">Quantum for shadcn/ui</p>
          <p className="text-xs text-muted-foreground">
            The <code className="font-mono">{STYLE}</code> components, unmodified, on <code className="font-mono">dist/quantum.css</code>
          </p>
        </div>
        <NativeSelect
          aria-label="Jump to a section"
          className="w-48"
          value=""
          onChange={(e) => document.getElementById(e.target.value)?.scrollIntoView()}
        >
          <NativeSelectOption value="" disabled>
            Jump to…
          </NativeSelectOption>
          {SECTIONS.map(([id, title]) => (
            <NativeSelectOption key={id} value={id}>
              {title}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Color scheme"
          value={scheme}
          onValueChange={(v) => v && setScheme(v as Scheme)}
        >
          <ToggleGroupItem value="light" aria-label="Light">
            <SunIcon /> Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark">
            <MoonIcon /> Dark
          </ToggleGroupItem>
          <ToggleGroupItem value="system" aria-label="System">
            <MonitorIcon /> System
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ sections */

function Variables() {
  const colors = Object.entries(VARS).filter(([name]) => name !== "radius")
  return (
    <Section
      id="variables"
      title="Theme variables"
      note="Every shadcn theme variable and the Quantum token it takes (src/mapping.mjs). Switch the color scheme to see the dark values."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map(([name, m]) => (
          <div key={name} className="flex items-center gap-3 rounded-md border p-2">
            <span className="size-10 shrink-0 rounded-md border" style={{ background: `var(--${name})` }} />
            <span className="min-w-0">
              <code className="block font-mono text-sm">--{name}</code>
              <code className="block truncate font-mono text-xs text-muted-foreground" title={m.token}>
                {m.token}
              </code>
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        {Object.entries(THEME_VARS)
          .filter(([name]) => name.startsWith("radius-"))
          .map(([name, m]) => (
            <div key={name} className="space-y-1 text-center">
              <div className="size-16 border-2 border-primary bg-muted" style={{ borderRadius: `var(--${name})` }} />
              <code className="block font-mono text-xs">--{name}</code>
              <code className="block font-mono text-[10px] text-muted-foreground">{m.token}</code>
            </div>
          ))}
      </div>
    </Section>
  )
}

function Typography() {
  return (
    <Section
      id="typography"
      title="Typography"
      note="--font-sans = body.family (Inter), --font-mono = mono.family (Fragment Mono). Sizes and weights are Tailwind's: shadcn's API has no type scale."
    >
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Heading 1, the quick brown fox</h1>
        <h2 className="text-3xl font-semibold tracking-tight">Heading 2, the quick brown fox</h2>
        <h3 className="text-2xl font-semibold tracking-tight">Heading 3, the quick brown fox</h3>
        <h4 className="text-xl font-semibold tracking-tight">Heading 4, the quick brown fox</h4>
        <p className="max-w-prose leading-7">
          Body text in Inter on the level-0 background. A design system is a set of decisions: this paragraph reads
          <code className="mx-1 rounded-sm bg-muted px-1 py-0.5 font-mono text-sm">--foreground</code>
          and links read{" "}
          <a href="#typography" className="font-medium text-primary underline underline-offset-4">
            --primary
          </a>
          .
        </p>
        <p className="text-sm text-muted-foreground">Muted text: --muted-foreground, for descriptions and hints.</p>
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm">
          {`@import "tailwindcss";\n@import "@quantum-ds/shadcn-theme/dist/quantum.css";`}
        </pre>
      </div>
    </Section>
  )
}

function Buttons() {
  const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
  return (
    <Section id="buttons" title="Buttons" quantum={["button", "icon-button"]}>
      <div className="space-y-4">
        <Row label="Variants">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </Row>
        <Row label="Sizes">
          {(["xs", "sm", "default", "lg"] as const).map((s) => (
            <Button key={s} size={s}>
              Size {s}
            </Button>
          ))}
        </Row>
        <Row label="Icon sizes">
          {(["icon-xs", "icon-sm", "icon", "icon-lg"] as const).map((s) => (
            <Button key={s} size={s} variant="secondary" aria-label={`Settings (${s})`}>
              <SettingsIcon />
            </Button>
          ))}
          {(["default", "outline", "ghost", "destructive"] as const).map((v) => (
            <Button key={v} size="icon" variant={v} aria-label={`Add (${v})`}>
              <PlusIcon />
            </Button>
          ))}
        </Row>
        <Row label="With icons">
          <Button>
            <PlusIcon /> Leading icon
          </Button>
          <Button variant="secondary">
            Trailing icon <ArrowRightIcon />
          </Button>
          <Button variant="destructive">
            <TrashIcon /> Delete
          </Button>
          <Button variant="outline" disabled>
            <Spinner /> Loading
          </Button>
        </Row>
        <Row label="Disabled">
          {variants.map((v) => (
            <Button key={v} variant={v} disabled>
              {v}
            </Button>
          ))}
        </Row>
      </div>
    </Section>
  )
}

function Badges() {
  return (
    <Section id="badges" title="Badges" quantum={["badge"]}>
      <Row>
        <Badge>default</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
        <Badge variant="ghost">ghost</Badge>
        <Badge variant="link">link</Badge>
        <Badge>
          <CheckCircle2Icon /> With icon
        </Badge>
      </Row>
    </Section>
  )
}

function Alerts() {
  return (
    <Section id="alerts" title="Alerts" quantum={["alert"]}>
      <div className="grid gap-4 md:grid-cols-2">
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Changes saved</AlertTitle>
          <AlertDescription>The default alert is a card surface with the --card colors.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>
            <p>The destructive alert colors its text with --destructive.</p>
          </AlertDescription>
        </Alert>
      </div>
    </Section>
  )
}

function Cards() {
  return (
    <Section id="cards" title="Cards" quantum={["card"]}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Aurora</CardTitle>
            <CardDescription>Level-1 surface, level-1 edge, 8px corners.</CardDescription>
            <CardAction>
              <Badge variant="secondary">Draft</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm">A card holds one subject. Its title reads --card-foreground, its description --muted-foreground.</p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Open</Button>
            <Button size="sm" variant="ghost">
              Share
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Form controls on a card.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="card-email">Email</FieldLabel>
                <Input id="card-email" type="email" placeholder="name@example.com" />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Continue</Button>
          </CardFooter>
        </Card>
      </div>
    </Section>
  )
}

function Forms() {
  const [slider, setSlider] = React.useState([40])
  return (
    <Section
      id="forms"
      title="Form controls"
      quantum={["text-field", "textarea", "number-field", "search-field", "select", "checkbox", "checkbox-group", "radio-group", "switch", "slider"]}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" placeholder="Ada Lovelace" />
            <FieldDescription>As it appears on your badge.</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" defaultValue="ada@" aria-invalid />
            <FieldError>Enter a complete email address.</FieldError>
          </Field>
          <Field data-disabled>
            <FieldLabel htmlFor="disabled">Disabled</FieldLabel>
            <Input id="disabled" placeholder="Not editable" disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="quantity">Quantity (number field)</FieldLabel>
            <Input id="quantity" type="number" defaultValue={3} min={0} max={10} />
          </Field>
          <Field>
            <FieldLabel htmlFor="search">Search (input group)</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput id="search" placeholder="Search components" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>Go</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea id="message" placeholder="Tell us more" />
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="message-invalid">Message (invalid)</FieldLabel>
            <Textarea id="message-invalid" aria-invalid defaultValue="Too short" />
            <FieldError>Write at least 20 characters.</FieldError>
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="country">Country (native select)</FieldLabel>
            <NativeSelect id="country" defaultValue="fr">
              <NativeSelectOption value="fr">France</NativeSelectOption>
              <NativeSelectOption value="uk">United Kingdom</NativeSelectOption>
              <NativeSelectOption value="us">United States</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel>Fruit (select)</FieldLabel>
            <Select defaultValue="apple">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="cherry">Cherry</SelectItem>
                  <SelectItem value="kiwi" disabled>
                    Kiwi (out of stock)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <FieldSet>
            <FieldLegend variant="label">Notifications (checkbox group)</FieldLegend>
            <FieldDescription>Choose what you hear about.</FieldDescription>
            <FieldGroup className="gap-3">
              <Field orientation="horizontal">
                <Checkbox id="cb-1" defaultChecked />
                <FieldLabel htmlFor="cb-1" className="font-normal">
                  Releases
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="cb-2" />
                <FieldLabel htmlFor="cb-2" className="font-normal">
                  Security advisories
                </FieldLabel>
              </Field>
              <Field orientation="horizontal" data-invalid>
                <Checkbox id="cb-3" aria-invalid />
                <FieldLabel htmlFor="cb-3" className="font-normal">
                  Terms (invalid)
                </FieldLabel>
              </Field>
              <Field orientation="horizontal" data-disabled>
                <Checkbox id="cb-4" disabled defaultChecked />
                <FieldLabel htmlFor="cb-4" className="font-normal">
                  Disabled
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldLegend variant="label">Plan (radio group)</FieldLegend>
            <RadioGroup defaultValue="team">
              {["Personal", "Team", "Enterprise"].map((p) => (
                <Field key={p} orientation="horizontal">
                  <RadioGroupItem value={p.toLowerCase()} id={`plan-${p}`} />
                  <FieldLabel htmlFor={`plan-${p}`} className="font-normal">
                    {p}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Switch id="airplane" defaultChecked />
            <FieldLabel htmlFor="airplane">Airplane mode</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Switch id="wifi" />
            <FieldLabel htmlFor="wifi">Wi-Fi</FieldLabel>
          </Field>
          <Field orientation="horizontal" data-disabled>
            <Switch id="bt" disabled />
            <FieldLabel htmlFor="bt">Bluetooth (disabled)</FieldLabel>
          </Field>
          <Field>
            <FieldLabel>Volume: {slider[0]}</FieldLabel>
            <Slider value={slider} onValueChange={setSlider} max={100} step={1} aria-label="Volume" />
          </Field>
          <Field>
            <Label>Range (disabled)</Label>
            <Slider defaultValue={[20, 70]} max={100} disabled aria-label="Range" />
          </Field>
        </FieldGroup>
      </div>
    </Section>
  )
}

function AccordionDemo() {
  return (
    <Section id="accordion" title="Accordion" quantum={["accordion"]}>
      <Accordion type="single" collapsible defaultValue="item-1" className="max-w-xl">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Quantum?</AccordionTrigger>
          <AccordionContent>The design system of Thales: specifications, tokens and a reference implementation.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is this theme a fork of shadcn/ui?</AccordionTrigger>
          <AccordionContent>No: the components are shadcn's own; only the theme variables change.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
          <AccordionContent>Yes, with the dark class on an ancestor, from the Quantum dark mode.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Section>
  )
}

function Navigation() {
  return (
    <Section id="navigation" title="Breadcrumb and pagination" quantum={["breadcrumb", "pagination"]}>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#navigation">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#navigation">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#navigation" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#navigation">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#navigation" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#navigation">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#navigation" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Section>
  )
}

function Feedback() {
  return (
    <Section id="feedback" title="Progress, skeleton, spinner" quantum={["progress-bar", "skeleton", "spinner"]}>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <Progress value={25} aria-label="25%" />
          <Progress value={60} aria-label="60%" />
          <Progress value={100} aria-label="100%" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Spinner />
          <Spinner className="size-6" />
          <Spinner className="size-8 text-primary" />
        </div>
      </div>
    </Section>
  )
}

const AVATAR_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#497EDE"/><circle cx="20" cy="16" r="7" fill="#EEF1F7"/><path d="M6 38c2-9 8-13 14-13s12 4 14 13" fill="#EEF1F7"/></svg>'
  )

function AvatarDemo() {
  return (
    <Section id="avatar" title="Avatar" quantum={["avatar"]}>
      <Row>
        <Avatar size="sm">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={AVATAR_IMAGE} alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>KJ</AvatarFallback>
        </Avatar>
      </Row>
    </Section>
  )
}

function SeparatorDemo() {
  return (
    <Section id="separator" title="Separator" quantum={["divider"]}>
      <div className="max-w-md space-y-3">
        <p className="text-sm font-medium">Quantum Design System</p>
        <Separator />
        <div className="flex h-5 items-center gap-4 text-sm">
          <span>Tokens</span>
          <Separator orientation="vertical" />
          <span>Components</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
        </div>
      </div>
    </Section>
  )
}

function Menus() {
  const [showStatus, setShowStatus] = React.useState(true)
  return (
    <Section id="menus" title="Dropdown menu" quantum={["dropdown"]}>
      <Row>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Options <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Billing (disabled)</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
              Show status bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <TrashIcon /> Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Row>
    </Section>
  )
}

function DialogDemo() {
  return (
    <Section id="dialog" title="Dialog" note={`No Quantum component yet (shadcn only: ${SHADCN_ONLY.join(", ")}). The dialog reads --background and --border, with rounded-lg.`}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile, then save.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dialog-name">Name</FieldLabel>
              <Input id="dialog-name" defaultValue="Ada Lovelace" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  )
}

function TabsDemo() {
  return (
    <Section id="tabs" title="Tabs" note="No Quantum component yet: the list reads --muted, the active tab --background.">
      <Tabs defaultValue="overview" className="max-w-xl">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="disabled" disabled>
            Disabled
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="text-sm">
          The theme maps shadcn's variables to Quantum tokens.
        </TabsContent>
        <TabsContent value="tokens" className="text-sm">
          Semantic tokens first, component tokens where shadcn's variable is a component decision.
        </TabsContent>
        <TabsContent value="usage" className="text-sm">
          Import dist/quantum.css after tailwindcss.
        </TabsContent>
      </Tabs>
    </Section>
  )
}

const ROWS = [
  ["INV-001", "Paid", "Credit card", "€250.00"],
  ["INV-002", "Pending", "Transfer", "€150.00"],
  ["INV-003", "Unpaid", "Credit card", "€350.00"],
]

function TableDemo() {
  return (
    <Section id="table" title="Table" note="No Quantum component yet: rows are separated by --border and hover on --muted.">
      <Table>
        <TableCaption>Recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map(([id, status, method, amount]) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{id}</TableCell>
              <TableCell>
                <Badge variant={status === "Unpaid" ? "destructive" : status === "Paid" ? "default" : "secondary"}>{status}</Badge>
              </TableCell>
              <TableCell>{method}</TableCell>
              <TableCell className="text-right font-mono">{amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right font-mono">€750.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Section>
  )
}

function TooltipDemo() {
  return (
    <Section id="tooltip" title="Tooltip" note="No Quantum component yet: the tooltip is an inverted surface (--foreground background, --background text).">
      <Row>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover or focus me</Button>
          </TooltipTrigger>
          <TooltipContent>Add to library</TooltipContent>
        </Tooltip>
      </Row>
    </Section>
  )
}

function Toggles() {
  return (
    <Section id="toggles" title="Toggles" note="No Quantum component yet: the pressed state reads --accent, the outline variant --input.">
      <div className="space-y-4">
        <Row label="Toggle">
          <Toggle aria-label="Bold" defaultPressed>
            <BoldIcon />
          </Toggle>
          <Toggle aria-label="Italic">
            <ItalicIcon />
          </Toggle>
          <Toggle variant="outline" aria-label="Underline">
            <UnderlineIcon /> Underline
          </Toggle>
          <Toggle disabled aria-label="Disabled">
            Disabled
          </Toggle>
        </Row>
        <Row label="Toggle group">
          <ToggleGroup type="multiple" variant="outline" defaultValue={["bold"]}>
            <ToggleGroupItem value="bold" aria-label="Bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" defaultValue="sm" size="sm">
            <ToggleGroupItem value="sm">Small</ToggleGroupItem>
            <ToggleGroupItem value="md">Medium</ToggleGroupItem>
            <ToggleGroupItem value="lg">Large</ToggleGroupItem>
          </ToggleGroup>
        </Row>
      </div>
    </Section>
  )
}

export default function App() {
  const [scheme, setScheme] = useScheme()
  return (
    <TooltipProvider>
      <Toolbar scheme={scheme} setScheme={setScheme} />
      <main className="mx-auto max-w-6xl space-y-14 px-4 py-10">
        <Variables />
        <Typography />
        <Buttons />
        <Badges />
        <Alerts />
        <Cards />
        <Forms />
        <AccordionDemo />
        <Navigation />
        <Feedback />
        <AvatarDemo />
        <SeparatorDemo />
        <Menus />
        <DialogDemo />
        <TabsDemo />
        <TableDemo />
        <TooltipDemo />
        <Toggles />
      </main>
    </TooltipProvider>
  )
}
