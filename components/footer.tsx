"use client";
import { Footer } from "@/components/ui/modernfooter";
import Image from "next/image";
import { GridPattern  } from "./ui/grid-pattern";
import { cn } from '@/lib/utils'
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";

export default function FooterDemo() {
  const socialLinks = [
    {
      icon: <Twitter className="w-6 h-6" />,
      href: "https://twitter.com/imshilok",
      label: "Twitter",
    },
    {
      icon: <Linkedin className="w-6 h-6" />,
      href: "https://linkedin.com/shilokkumar",
      label: "LinkedIn",
    },
    {
      icon: <Github className="w-6 h-6" />,
      href: "https://github.com/shilok09",
      label: "GitHub",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      href: "",
      label: "Email",
    },
  ];

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "FAQs", href: "#faqs" },
  ];

  return (
    <>
      <Footer
        brandName="Nexa"
        brandDescription="Nexa is an AI career engine that turns your resume into a roadmap for the right roles."
        socialLinks={socialLinks}
        navLinks={navLinks}
        creators={[
          { name: "Shilok", url: "https://shilok.dev" },
          { name: "Fatima", url: "https://fatimatuzahraportfolio.vercel.app/" },
          { name: "Ramalah", url: "https://www.linkedin.com/in/ramalah-amir/" }
        ]}
        brandIcon={
          <Image
            src="/logo.svg"
            alt="Nexa Logo"
            width={56}
            height={56}
            className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 drop-shadow-lg"
          />
        }
      />
    </>
  );
}
