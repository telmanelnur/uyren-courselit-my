"use client";

import { useSiteInfo } from "@/components/contexts/site-info-context";
import Link from "next/link";
import Image from "next/image";


export default function Footer() {
    const { siteInfo } = useSiteInfo();

    const quickLinks = [
        { name: "Courses", href: "/courses" },
        { name: "Blog", href: "/blog" },
    ];

    const supportLinks = [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ];



    return (
        <footer className="bg-card border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            {siteInfo?.logo?.file ? (
                                <Image
                                    src={siteInfo.logo.file}
                                    alt={siteInfo.logo.caption || siteInfo.title || "Logo"}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {siteInfo?.title?.charAt(0) || "U"}
                                    </span>
                                </div>
                            )}
                            <span className="text-xl font-bold text-foreground">
                                {siteInfo?.title || "Uyren Academy"}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {siteInfo?.subtitle || "Learn what actually matters: Python, ML, science. No fluff. Just challenges, structure, and growth."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-brand-primary transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Support</h3>
                        <ul className="space-y-2">
                            {supportLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-brand-primary transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>


                </div>

                {/* Bottom Section */}
                <div className="border-t border-border mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-muted-foreground text-sm">
                            © {new Date().getFullYear()} {siteInfo?.title || "Uyren Academy"}. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link href="/privacy" className="text-muted-foreground hover:text-brand-primary text-sm transition-colors duration-200">
                                Privacy
                            </Link>
                            <Link href="/terms" className="text-muted-foreground hover:text-brand-primary text-sm transition-colors duration-200">
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
