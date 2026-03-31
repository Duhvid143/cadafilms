"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import '@/styles/ProjectSubNav.css';

interface ProjectSubNavProps {
    isOpen: boolean;
}

const ProjectSubNav: React.FC<ProjectSubNavProps> = ({ isOpen }) => {
    const pathname = usePathname();
    const tiumRef = useRef<HTMLAnchorElement>(null);
    const muitRef = useRef<HTMLAnchorElement>(null);
    const tiumBgRef = useRef<HTMLDivElement>(null);
    const muitBgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animate active state
        const isTium = pathname.includes('tium');
        const isMuit = pathname.includes('muit');

        if (tiumBgRef.current) {
            gsap.to(tiumBgRef.current, {
                scaleX: isTium ? 1 : 0,
                opacity: isTium ? 1 : 0,
                duration: 0.4,
                ease: "power2.out"
            });
        }

        if (muitBgRef.current) {
            gsap.to(muitBgRef.current, {
                scaleX: isMuit ? 1 : 0,
                opacity: isMuit ? 1 : 0,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }, [pathname]);

    return (
        <div className={`project-subnav ${isOpen ? 'visible' : ''}`}>
            <Link href="/tium" className={`subnav-link ${pathname.includes('tium') ? 'active' : ''}`} ref={tiumRef}>
                TIUM_
                <div className="subnav-link-bg" ref={tiumBgRef} />
            </Link>

            <div className="subnav-separator" />

            <Link href="/muit" className={`subnav-link ${pathname.includes('muit') ? 'active' : ''}`} ref={muitRef}>
                MUIT
                <div className="subnav-link-bg" ref={muitBgRef} />
            </Link>
        </div>
    );
};

export default ProjectSubNav;
