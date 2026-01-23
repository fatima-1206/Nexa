'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Create a smooth scroll effect
    const scrollContainer = document.querySelector('[data-scroll-container]')
    
    if (!scrollContainer) return

    let ctx = gsap.context(() => {
      // Smooth scrolling with GSAP
      const sections = gsap.utils.toArray('[data-scroll-section]')
      
      sections.forEach((section: any) => {
        gsap.from(section, {
          opacity: 0,
          y: 100,
          duration: 2.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return <div data-scroll-container>{children}</div>
}
