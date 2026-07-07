import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  ref?: React.Ref<HTMLInputElement>
}

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className={cn("relative rounded-lg", className)}>
      <input
        type={showPassword ? "text" : "password"}
        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground shadow-sm transition-all duration-200 outline-none placeholder:text-muted-foreground hover:border-ring/40 focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--ring),0_1px_2px_rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_2px_6px_rgba(0,0,0,0.45)]"
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        className="absolute end-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </Button>
    </div>
  )
}
