"use client"

import { useState } from "react"
import { Button } from "./button"

interface ToggleButtonProps {
  onToggle?: (isToggled: boolean) => void
  defaultToggled?: boolean
  toggledText?: string
  untoggledText?: string
  className?: string
}

export function ToggleButton({
  onToggle,
  defaultToggled = false,
  toggledText = "ON",
  untoggledText = "OFF",
  className = "",
}: ToggleButtonProps) {
  const [isToggled, setIsToggled] = useState(defaultToggled)

  const handleToggle = () => {
    const newState = !isToggled
    setIsToggled(newState)
    onToggle?.(newState)
  }

  return (
    <Button
      onClick={handleToggle}
      variant={isToggled ? "default" : "outline"}
      size="sm"
      className={`m--toggle-button transition-all duration-200 ${className}`}
    >
      {isToggled ? toggledText : untoggledText}
    </Button>
  )
}
