import { type SVGProps } from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { CircleCheck, RotateCcw, Settings } from "lucide-react"
import { IconLayoutCompact } from "@/assets/custom/icon-layout-compact"
import { IconLayoutDefault } from "@/assets/custom/icon-layout-default"
import { IconLayoutFull } from "@/assets/custom/icon-layout-full"
import { IconSidebarFloating } from "@/assets/custom/icon-sidebar-floating"
import { IconSidebarInset } from "@/assets/custom/icon-sidebar-inset"
import { IconSidebarSidebar } from "@/assets/custom/icon-sidebar-sidebar"
import { IconThemeDark } from "@/assets/custom/icon-theme-dark"
import { IconThemeLight } from "@/assets/custom/icon-theme-light"
import { IconThemeSystem } from "@/assets/custom/icon-theme-system"
import { cn } from "@/lib/utils"
import { type Collapsible, useLayout } from "@/context/layout-provider"
import { useTheme } from "@/context/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"

const Radio = RadioGroupPrimitive.Root
const Item = RadioGroupPrimitive.Item

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    setOpen(true)
    resetTheme()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Abrir configuración de vista"
          aria-describedby="config-drawer-description"
          className="rounded-full"
        >
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Configuración de vista</SheetTitle>
          <SheetDescription id="config-drawer-description">
            Ajusta la apariencia y el diseño según tus preferencias.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
        </div>
        <SheetFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleReset}
            aria-label="Restablecer todos los ajustes a valores predeterminados"
          >
            Restablecer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground",
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size="icon"
          variant="secondary"
          className="size-4 rounded-full"
          onClick={onReset}
        >
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn("group outline-none", "transition duration-200 ease-in")}
      aria-label={`Seleccionar ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          "relative rounded-[6px] ring-[1px] ring-border",
          "group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary",
          "group-focus-visible:ring-2"
        )}
        role="img"
        aria-hidden="false"
        aria-label={`Vista previa de opción ${item.label}`}
      >
        <CircleCheck
          className={cn(
            "size-6 fill-primary stroke-white",
            "group-data-[state=unchecked]:hidden",
            "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            !isTheme &&
              "fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground"
          )}
          aria-hidden="true"
        />
      </div>
      <div
        className="mt-1 text-xs"
        id={`${item.value}-description`}
        aria-live="polite"
      >
        {item.label}
      </div>
    </Item>
  )
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  return (
    <div>
      <SectionTitle
        title="Tema"
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Seleccionar preferencia de tema"
        aria-describedby="theme-description"
      >
        {[
          {
            value: "system",
            label: "Sistema",
            icon: IconThemeSystem,
          },
          {
            value: "light",
            label: "Claro",
            icon: IconThemeLight,
          },
          {
            value: "dark",
            label: "Oscuro",
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
      <div id="theme-description" className="sr-only">
        Elige entre la preferencia del sistema, modo claro u oscuro
      </div>
    </div>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="Barra lateral"
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Seleccionar estilo de barra lateral"
        aria-describedby="sidebar-description"
      >
        {[
          {
            value: "inset",
            label: "Empotrada",
            icon: IconSidebarInset,
          },
          {
            value: "floating",
            label: "Flotante",
            icon: IconSidebarFloating,
          },
          {
            value: "sidebar",
            label: "Lateral",
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="sidebar-description" className="sr-only">
        Elige entre barra lateral empotrada, flotante o estándar
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()

  const radioState = open ? "default" : collapsible

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="Diseño"
        showReset={radioState !== "default"}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === "default") {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Seleccionar estilo de diseño"
        aria-describedby="layout-description"
      >
        {[
          {
            value: "default",
            label: "Predeterminado",
            icon: IconLayoutDefault,
          },
          {
            value: "icon",
            label: "Compacto",
            icon: IconLayoutCompact,
          },
          {
            value: "offcanvas",
            label: "Pantalla completa",
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="layout-description" className="sr-only">
        Elige entre modo expandido predeterminado, solo iconos compacto o
        pantalla completa
      </div>
    </div>
  )
}
