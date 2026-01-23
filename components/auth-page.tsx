'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
	AppleIcon,
	AtSignIcon,
	ChevronLeftIcon,
	GithubIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function AuthPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const router = useRouter();

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/dashboard`,
				},
			});
			if (error) throw error;
		} catch (error: any) {
			setMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleGithubSignIn = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'github',
				options: {
					redirectTo: `${window.location.origin}/dashboard`,
				},
			});
			if (error) throw error;
		} catch (error: any) {
			setMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			setMessage('');
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${window.location.origin}/dashboard`,
				},
			});
			if (error) throw error;
			setMessage('Check your email for the magic link!');
		} catch (error: any) {
			setMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8 relative" style={{
			backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
			backgroundSize: '16px 16px'
		}}>
			<main className="relative w-full max-w-6xl rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden md:h-[600px] lg:grid lg:grid-cols-2 bg-black">
				<div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex bg-neutral-900">
				<div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
				<div className="z-10 flex items-center gap-2">
					<Image src="/logo.svg" alt="Nexa Logo" width={28} height={28} />
					<p className="text-xl font-semibold">Nexa</p>
				</div>
				<div className="z-10 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-xl">
							Turn skills into real opportunities.
						    Get ready for the jobs that matter.
						</p>
						<footer className="font-mono text-sm font-semibold">
							- NEXA.
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="relative flex min-h-full flex-col justify-center p-8 md:p-12 bg-black">
				<div
					aria-hidden
					className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
				>
					<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
				</div>
				<Button variant="ghost" className="absolute top-4 left-4 text-muted-foreground hover:text-white" asChild>
					<a href="/">
						<ChevronLeftIcon className='size-4 me-2' />
						Home
					</a>
				</Button>
				<div className="mx-auto space-y-6 w-full max-w-sm">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-3xl font-bold tracking-tight">
							Sign In or Join Now!
						</h1>
						<p className="text-muted-foreground text-sm">
							login or create your nexa account.
						</p>
					</div>
					<div className="space-y-3">
						<Button 
							type="button" 
							size="lg" 
							variant="outline" 
							className="w-full text-base font-medium"
							onClick={handleGoogleSignIn}
							disabled={loading}
						>
							<GoogleIcon className='size-5 me-2' />
							{loading ? 'Loading...' : 'Continue with Google'}
						</Button>
						<Button 
							type="button" 
							size="lg" 
							variant="outline" 
							className="w-full text-base font-medium"
							onClick={handleGithubSignIn}
							disabled={loading}
						>
							<GithubIcon className='size-5 me-2' />
							{loading ? 'Loading...' : 'Continue with GitHub'}
						</Button>
					</div>

					<AuthSeparator />

					<form className="space-y-4" onSubmit={handleEmailSignIn}>
						<p className="text-muted-foreground text-center text-sm">
							Enter your email address to sign in or create an account
						</p>
						<div className="relative">
							<Input
								placeholder="your.email@example.com"
								className="peer ps-10 h-11"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
							/>
							<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
								<AtSignIcon className="size-4" aria-hidden="true" />
							</div>
						</div>

						<Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
							<span>{loading ? 'Sending...' : 'Continue With Email'}</span>
						</Button>
						
						{message && (
							<p className={cn(
								"text-center text-sm",
								message.includes('Check your email') ? 'text-green-500' : 'text-red-500'
							)}>
								{message}
							</p>
						)}
					</form>
					
					<p className="text-muted-foreground text-center text-xs leading-relaxed pt-4">
						By clicking continue, you agree to our{' '}
						<a
							href="#"
							className="hover:text-[#f97316] underline underline-offset-4 transition-colors"
						>
							Terms of Service
						</a>{' '}
						and{' '}
						<a
							href="#"
							className="hover:text-[#f97316] underline underline-offset-4 transition-colors"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</main>
		</div>
	);
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(15,23,42,${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="#f97316"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);

const AuthSeparator = () => {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="bg-border h-px w-full" />
			<span className="text-muted-foreground px-2 text-xs">OR</span>
			<div className="bg-border h-px w-full" />
		</div>
	);
};
