"use client"

import { useRef } from "react"
import { useTheme } from "next-themes"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"

const ASCII = ["\u270E", "\u2710", "\u2711", "\u2711"]

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      ref={containerRef}
    >
      <div 
        className="relative w-full cursor-pointer overflow-hidden justify-start items-start flex"
        style={{ 
          backgroundColor: "#f97316",
          marginTop: "80px",
          minHeight: "180px",
          height: "auto"
        }}
      >
        <div className="flex flex-col justify-center uppercase leading-none pt-4 pb-4 pl-6">
          <TextCursorProximity
            label="STOP GUESSING"
            className="text-3xl will-change-transform sm:text-6xl md:text-6xl lg:text-7xl font-overusedGrotesk text-black"
            styles={{
              transform: {
                from: "scale(1)",
                to: "scale(1.4)",
              },
              color: { 
                from: "#000000", 
                to: "#0F0F0F"
              },
            }}
            falloff="gaussian"
            radius={100}
            containerRef={containerRef}
          />
          <TextCursorProximity
            label="START PREPARING WITH NEXA."
            className="leading-none text-3xl will-change-transform sm:text-6xl md:text-6xl lg:text-7xl font-overusedGrotesk text-black"
            styles={{
              transform: {
                from: "scale(1)",
                to: "scale(1.4)",
              },
              color: { 
                from: "#000000", 
                to: "#0F0F0F"
              },
            }}
            falloff="gaussian"
            radius={100}
            containerRef={containerRef}
          />
        </div>

        <div className="absolute bottom-2 flex w-full justify-between px-6">
          {ASCII.map((pencil, i) => (
            <span 
              key={i} 
              className="text-2xl opacity-80 text-black"
              style={{ fontFamily: "serif" }}
            >
              {pencil}
            </span>
          ))}
        </div>

        <TextCursorProximity
          className="absolute top-6 right-6 hidden sm:block text-xs text-black"
          label="15/01/2025"
          styles={{
            transform: {
              from: "scale(1)",
              to: "scale(1.4)",
            },
            color: { 
              from: "#000000", 
              to: "#0F0F0F"
            },
          }}
          falloff="linear"
          radius={10}
          containerRef={containerRef}
        />
      </div>
    </div>
  )
}

export { Preview }