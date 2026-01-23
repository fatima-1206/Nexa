import Image from 'next/image'
import { GridPattern } from '@/components/ui/grid-pattern'
import { cn } from '@/lib/utils'

export default function ContentSection() {
    return (
        <section className="relative py-16 md:py-16 overflow-hidden">
            <GridPattern
                width={30}
                height={30}
                x={-1}
                y={-1}
                strokeDasharray={"4 2"}
                className={cn(
                    "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
                )}
            />
            <div className="relative mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-4xl">The Nexa ecosystem brings career goals into focus.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6  sm:mb-0" >
                        <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image src="/interview.png" className="hidden rounded-[15px] dark:block" alt="payments illustration dark" width={1207} height={929} />
                            <Image src="/interview.png" className="rounded-[15px] shadow dark:hidden" alt="payments illustration light" width={1207} height={929} />
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                           Nexa is evolving to be more than just a job board.<span className="text-accent-foreground font-bold">It supports an entire growth ecosystem—from initial resume analysis to the exact resources helping candidates and professionals innovate.</span>
                        </p>
                        <p className="text-muted-foreground">Turns skill gaps into interview-ready confidence.</p>

                        <div className="pt-6">
                            <blockquote className="border-l-4 pl-4">
                                <p>NEXA feels like a career superpower — combining market intelligence with personalized upskilling.</p>

                                <div className="mt-6 space-y-3">
                                    <cite className="block font-medium">John Doe, CEO</cite>
                                    {/* <img className="h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto" /> */}
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
