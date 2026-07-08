import { useEffect, useState } from "react"
import { IconSearch } from "@tabler/icons-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft)
    }, debounceMs)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, debounceMs])

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <IconSearch className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
      />
    </InputGroup>
  )
}
