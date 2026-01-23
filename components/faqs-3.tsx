'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Clock, CreditCard, Truck, Globe, Package, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { GridPattern } from '@/components/ui/grid-pattern'
import { cn } from '@/lib/utils'

type FAQItem = {
    id: string
    icon: LucideIcon
    question: string
    answer: string
}

export default function FAQsThree() {
    const faqItems: FAQItem[] = [
    {
        id: 'item-1',
        icon: Clock,
        question: 'How does NEXA work?',
        answer: 'NEXA analyzes your resume and skills using AI, matches you with relevant job roles, identifies skill gaps, and guides you with personalized resources and interview preparation.',
    },
    {
        id: 'item-2',
        icon: CreditCard,
        question: 'Is NEXA free to use?',
        answer: 'NEXA offers a free plan with core features. Premium plans unlock advanced job matching, in-depth skill analysis, interview practice, and personalized learning recommendations.',
    },
    {
        id: 'item-3',
        icon: Truck,
        question: 'What types of jobs does NEXA support?',
        answer: 'NEXA supports a wide range of roles including software engineering, data science, product management, design, marketing, and other professional career paths.',
    },
    {
        id: 'item-4',
        icon: Globe,
        question: 'Is my resume and data secure?',
        answer: 'Yes. Your data is encrypted and securely stored. NEXA never shares your personal information without your consent and follows industry-standard security practices.',
    },
    {
        id: 'item-5',
        icon: Package,
        question: 'Can NEXA help with interview preparation?',
        answer: 'Absolutely. NEXA provides AI-powered interview practice, role-specific questions, feedback, and improvement suggestions tailored to your selected job.',
    },
]
    return (
        <section className="relative bg-background py-20 overflow-hidden">
            <div className="relative mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold lg:text-4xl">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-accent-foreground font-bold hover:underline">
                                    customer support team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-card rounded-2xl border border-border px-6 last:border-b backdrop-blur-sm">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent/50">
                                                <item.icon className="size-4" />
                                            </div>
                                            <span className="text-base font-medium">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-11">
                                            <p className="text-base text-muted-foreground">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
