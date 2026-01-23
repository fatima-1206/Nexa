import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Briefcase, Calendar, LucideIcon, MapIcon, BriefcaseBusiness } from 'lucide-react'
import Image from 'next/image'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section className="bg-neutral-950  py-12 md:py-20 " >
            <div className="mx-auto max-w-2xl px-6 lg:max-w-4xl">
                <div className="mx-auto grid gap-4 lg:grid-cols-2">
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={MapIcon}
                                title="Jobs Matched to Your Skills"
                                description="Find the right jobs instantly using AI-powered skill matching."
                            />
                        </CardHeader>

                        <div className="relative border-t border-dashed max-sm:mb-6">
                            <div
                                aria-hidden
                                className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--color-blue-600),var(--color-white)_100%)]"
                            />
                            <div className="aspect-76/59 p-1 px-6">
                                <DualModeImage
                                    darkSrc="/jobs.png"
                                    lightSrc="/jobs.png"
                                    alt="jobs illustration"
                                    width={1207}
                                    height={929}
                                />
                            </div>
                        </div>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={BriefcaseBusiness}
                                title="Prepare for Your Target Role"
                                description="Prepare smarter with AI guidance tailored to your selected role."
                            />
                        </CardHeader>

                        <CardContent>
                            <div className="mask-radial-at-right mask-radial-from-75% mask-radial-[75%_75%] relative max-sm:mb-6">
                                <div className="aspect-76/59 overflow-hidden rounded-lg border">
                                    <DualModeImage
                                        darkSrc="/interview.png"
                                        lightSrc="/interview.png"
                                        alt="jobs illustration"
                                        width={1207}
                                        height={929}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </FeatureCard>
                </div>
            </div>
        </section>
    )
}

interface FeatureCardProps {
    children: ReactNode
    className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
    <Card className={cn('group relative rounded-none shadow-zinc-950/5', className)}>
        <CardDecorator />
        {children}
    </Card>
)

const CardDecorator = () => (
    <>
        <span className="absolute -left-px -top-px block size-2 border-l-2 border-t-2" style={{ borderColor: '#f97316' }}></span>
        <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2" style={{ borderColor: '#f97316' }}></span>
        <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2" style={{ borderColor: '#f97316' }}></span>
        <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2" style={{ borderColor: '#f97316' }}></span>
    </>
)

interface CardHeadingProps {
    icon: LucideIcon
    title: string
    description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
    <div className="p-4">
        <span className="text-muted-foreground flex items-center gap-2">
            <Icon className="size-4" />
            {title}
        </span>
        <p className="mt-4 text-2xl font-semibold">{description}</p>
    </div>
)

interface DualModeImageProps {
    darkSrc: string
    lightSrc: string
    alt: string
    width: number
    height: number
    className?: string
}

const DualModeImage = ({ darkSrc, lightSrc, alt, width, height, className }: DualModeImageProps) => (
    <>
        <Image
            src={darkSrc}
            className={cn('hidden dark:block', className)}
            alt={`${alt} dark`}
            width={width}
            height={height}
        />
        <Image
            src={lightSrc}
            className={cn('shadow dark:hidden', className)}
            alt={`${alt} light`}
            width={width}
            height={height}
        />
    </>
)

interface CircleConfig {
    pattern: 'none' | 'border' | 'primary' | 'blue'
}

interface CircularUIProps {
    label: string
    circles: CircleConfig[]
    className?: string
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
    <div className={className}>
        <div className="bg-linear-to-b from-border size-fit rounded-2xl to-transparent p-px">
            <div className="bg-linear-to-b from-background to-muted/25 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4">
                {circles.map((circle, i) => (
                    <div
                        key={i}
                        className={cn('size-7 rounded-full border sm:size-8', {
                            'border-primary': circle.pattern === 'none',
                            'border-primary bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'border',
                            'border-primary bg-background bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'primary',
                            'bg-background z-1 border-blue-500 bg-[repeating-linear-gradient(-45deg,var(--color-blue-500),var(--color-blue-500)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'blue',
                        })}></div>
                ))}
            </div>
        </div>
        <span className="text-muted-foreground mt-1.5 block text-center text-sm">{label}</span>
    </div>
)
