/**
 * PIYUSH NIRWAN PORTFOLIO — THE GROWING TREE
 * Vanilla JavaScript Engine
 * Features:
 *  - Intro Animation Controller (Detailed tree silhouette sway, falling swaying leaf, skip button)
 *  - Background Sakura Petals Physics Canvas
 *  - Growing Pink Tree Branch on Scroll & Blooming Section Nodes
 *  - Custom Glowing Pink Cursor with Lerp Physics
 *  - Letter-by-Letter Editorial Text Reveals
 *  - 3D Interactive Perspective Tilt on Cards with Specular Glare
 *  - Magnetic Buttons
 *  - Interactive Utilities (Email Copy, AI Twin Launch trigger)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ===================================================================
       1. INTRO ANIMATION CONTROLLER (Tree silhouette & swaying leaf)
       =================================================================== */
    const introOverlay = document.getElementById('intro-overlay');
    const skipIntroBtn = document.getElementById('skipIntroBtn');
    const fallingLeafActor = document.getElementById('falling-leaf-actor');
    const staticLeafOrigin = document.getElementById('intro-static-leaf');
    let introDismissed = false;

    function dismissIntro() {
        if (introDismissed) return;
        introDismissed = true;

        if (introOverlay) {
            introOverlay.classList.add('fade-out');
            document.body.classList.remove('is-loading');

            // Trigger hero text reveal immediately once intro fades
            const heroTitle = document.querySelector('.hero-name-title');
            if (heroTitle) {
                heroTitle.classList.add('is-revealed');
            }

            // Completely hide overlay after fade transition to prevent blocking clicks
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 1200);
        }
    }

    // Start detached falling leaf animation after a brief ambient sway
    setTimeout(() => {
        if (staticLeafOrigin) {
            staticLeafOrigin.style.opacity = '0';
        }
        if (fallingLeafActor && !introDismissed) {
            fallingLeafActor.classList.add('is-falling');
        }
    }, 900);

    // Auto-dismiss intro when falling leaf completes its journey (~5.4s)
    setTimeout(() => {
        dismissIntro();
    }, 5400);

    // Skip button click handler
    if (skipIntroBtn) {
        skipIntroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dismissIntro();
        });
    }

    // Skip via Escape key shortcut
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dismissIntro();
        }
    });

    /* ===================================================================
       2. FALLING PINK PETALS PHYSICS ENGINE (Canvas)
       =================================================================== */
    const canvas = document.getElementById('petals-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const petalsCount = window.innerWidth < 768 ? 24 : 45;
        const petals = [];

        // Mouse influence
        let mouseX = width / 2;
        let mouseY = height / 2;
        let mouseVelocityX = 0;
        let lastMouseX = mouseX;

        window.addEventListener('mousemove', (e) => {
            mouseVelocityX = (e.clientX - lastMouseX) * 0.05;
            mouseX = e.clientX;
            mouseY = e.clientY;
            lastMouseX = mouseX;
        });

        // Petal constructor
        class Petal {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : -20 - Math.random() * 40;
                this.size = 10 + Math.random() * 12;
                this.speedY = 1.0 + Math.random() * 1.6;
                this.speedX = (Math.random() - 0.5) * 1.2;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.035;
                this.flip = Math.random() * Math.PI;
                this.flipSpeed = 0.02 + Math.random() * 0.03;
                this.swayAngle = Math.random() * Math.PI * 2;
                this.swaySpeed = 0.015 + Math.random() * 0.025;
                this.swayDistance = 0.8 + Math.random() * 1.5;
                this.opacity = 0.35 + Math.random() * 0.45;
                
                // Color variations from neon pink to soft sakura
                const pinks = ['#ff2a75', '#ff5992', '#ff85ae', '#ffa8c5'];
                this.color = pinks[Math.floor(Math.random() * pinks.length)];
            }

            update() {
                this.swayAngle += this.swaySpeed;
                this.rotation += this.rotSpeed;
                this.flip += this.flipSpeed;

                // Swaying drift
                this.x += Math.sin(this.swayAngle) * this.swayDistance + this.speedX + mouseVelocityX * 0.15;
                this.y += this.speedY;

                // Gentle mouse repulsion
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x += (dx / dist) * force * 2.2;
                    this.y += (dy / dist) * force * 1.5;
                }

                // Recycle when falling past screen
                if (this.y > height + 30 || this.x < -40 || this.x > width + 40) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                // 3D perspective tumbling illusion via vertical scale
                const scaleY = Math.cos(this.flip);
                ctx.scale(1, scaleY);
                ctx.globalAlpha = this.opacity;

                // Draw organic curved sakura petal shape
                ctx.beginPath();
                ctx.moveTo(0, -this.size * 0.6);
                ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.5, this.size * 0.7, this.size * 0.5, 0, this.size * 0.8);
                ctx.bezierCurveTo(-this.size * 0.7, this.size * 0.5, -this.size * 0.6, -this.size * 0.5, 0, -this.size * 0.6);
                
                ctx.fillStyle = this.color;
                ctx.shadowColor = 'rgba(255, 42, 117, 0.4)';
                ctx.shadowBlur = 6;
                ctx.fill();

                // Subtle inner vein highlight
                ctx.beginPath();
                ctx.moveTo(0, -this.size * 0.4);
                ctx.lineTo(0, this.size * 0.5);
                ctx.strokeStyle = '#ffffff';
                ctx.globalAlpha = this.opacity * 0.45;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                ctx.restore();
            }
        }

        for (let i = 0; i < petalsCount; i++) {
            petals.push(new Petal());
        }

        let animationFrameId;
        function animatePetals() {
            ctx.clearRect(0, 0, width, height);
            
            // Decelerate mouse velocity impulse
            mouseVelocityX *= 0.95;

            for (let i = 0; i < petals.length; i++) {
                petals[i].update();
                petals[i].draw();
            }

            animationFrameId = requestAnimationFrame(animatePetals);
        }

        animatePetals();

        // Responsive resize
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Pause animation when tab is not visible to preserve GPU
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animatePetals();
            }
        });
    }

    /* ===================================================================
       3. "A TREE THAT GROWS AS YOU SCROLL" (Spine Branch & Bloom Nodes)
       =================================================================== */
    const growingBranchPath = document.getElementById('branch-growing-path');
    const treeNodes = document.querySelectorAll('.tree-node');
    const sections = document.querySelectorAll('.portfolio-section');

    let pathLength = 2000;
    if (growingBranchPath) {
        try {
            pathLength = growingBranchPath.getTotalLength();
            growingBranchPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
            growingBranchPath.style.strokeDashoffset = `${pathLength}`;
        } catch (e) {
            // fallback
            pathLength = 2000;
        }
    }

    function updateTreeGrowth() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;

        // Animate the pink branch growth dynamically
        if (growingBranchPath) {
            const drawOffset = pathLength * (1 - scrollFraction);
            growingBranchPath.style.strokeDashoffset = `${drawOffset}`;
        }

        // Determine current section in view and bloom leaf nodes
        let activeSectionId = 'home';
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            // If top of section is within upper half of viewport
            if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.15) {
                activeSectionId = section.id;
            }
        });

        // Update blooming state for each node along the tree
        let passedActive = false;
        treeNodes.forEach((node) => {
            const nodeSection = node.getAttribute('data-section');
            const targetSection = document.getElementById(nodeSection);

            if (targetSection) {
                const targetRect = targetSection.getBoundingClientRect();
                
                // If section is scrolled past or currently active, it blooms!
                if (targetRect.top <= window.innerHeight * 0.55) {
                    node.classList.add('bloomed');
                } else {
                    node.classList.remove('bloomed');
                }

                if (nodeSection === activeSectionId) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateTreeGrowth, { passive: true });
    updateTreeGrowth(); // Initial invocation

    // Smooth navigation click for tree nodes
    treeNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = node.getAttribute('data-section');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ===================================================================
       4. CUSTOM GLOWING PINK CURSOR WITH LERP PHYSICS
       =================================================================== */
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    if (cursorDot && cursorRing) {
        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        let isCursorActive = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isCursorActive) {
                ringX = mouseX;
                ringY = mouseY;
                isCursorActive = true;
            }
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth lerp loop for outer glowing ring
        function renderCursorRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;

            requestAnimationFrame(renderCursorRing);
        }
        renderCursorRing();

        // Hover expansions on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .tree-node, input, textarea');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursorRing.classList.add('cursor-hover');
            });
            target.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('cursor-hover');
            });
        });

        // Click ripple pulse
        window.addEventListener('mousedown', () => {
            cursorRing.classList.add('cursor-click');
        });
        window.addEventListener('mouseup', () => {
            cursorRing.classList.remove('cursor-click');
        });
    }

    /* ===================================================================
       5. LETTER-BY-LETTER TEXT REVEAL ENGINE
       =================================================================== */
    function initTextReveals() {
        const revealElements = document.querySelectorAll('.reveal-text');

        revealElements.forEach(el => {
            const rawText = el.textContent.trim();
            el.textContent = '';
            el.setAttribute('aria-label', rawText);

            // Split into characters
            const words = rawText.split(' ');
            let globalCharIndex = 0;

            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';

                for (let i = 0; i < word.length; i++) {
                    const charSpan = document.createElement('span');
                    charSpan.classList.add('char');
                    charSpan.textContent = word[i];
                    charSpan.style.setProperty('--char-index', globalCharIndex);
                    globalCharIndex++;
                    wordSpan.appendChild(charSpan);
                }

                el.appendChild(wordSpan);

                // Add space between words
                if (wordIndex < words.length - 1) {
                    const spaceNode = document.createTextNode(' ');
                    el.appendChild(spaceNode);
                }
            });
        });

        // IntersectionObserver to trigger reveals when scrolled into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    initTextReveals();

    /* ===================================================================
       6. 3D PERSPECTIVE TILT ON CARDS WITH SPECULAR RADIAL GLARE
       =================================================================== */
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        let bounds;

        function updateBounds() {
            bounds = card.getBoundingClientRect();
        }

        card.addEventListener('mouseenter', updateBounds);
        window.addEventListener('resize', updateBounds);

        card.addEventListener('mousemove', (e) => {
            if (!bounds) updateBounds();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;

            // Normalized position (-0.5 to 0.5)
            const xPercent = (mouseX / bounds.width) - 0.5;
            const yPercent = (mouseY / bounds.height) - 0.5;

            // Subtle rotation angles
            const tiltX = -yPercent * 10; // degrees
            const tiltY = xPercent * 10;

            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;

            // Update radial specular reflection coordinates
            const glareX = `${(mouseX / bounds.width * 100).toFixed(1)}%`;
            const glareY = `${(mouseY / bounds.height * 100).toFixed(1)}%`;
            card.style.setProperty('--glare-x', glareX);
            card.style.setProperty('--glare-y', glareY);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });

    /* ===================================================================
       7. MAGNETIC BUTTONS (Attracts smoothly toward cursor)
       =================================================================== */
    const magneticButtons = document.querySelectorAll('.magnetic-btn');

    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left + rect.width / 2;
            const btnCenterY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - btnCenterX) * 0.28;
            const deltaY = (e.clientY - btnCenterY) * 0.28;

            btn.style.transform = `translate(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    /* ===================================================================
       8. "TALK TO MY AI TWIN" BUTTON & BOTPRESS CONTAINER READY
       =================================================================== */
    const launchAiTwinBtn = document.getElementById('launchAiTwinBtn');
    const chatbotContainer = document.getElementById('chatbot-container');

    if (launchAiTwinBtn && chatbotContainer) {
        launchAiTwinBtn.addEventListener('click', () => {
            // Smoothly highlight and present the container
            chatbotContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Provide a graceful state prompt in the container if Botpress hasn't been loaded yet
            if (!chatbotContainer.innerHTML.trim()) {
                chatbotContainer.innerHTML = `
                    <div style="
                        margin-top: 24px;
                        padding: 24px 28px;
                        background: rgba(255, 42, 117, 0.08);
                        border: 1px dashed rgba(255, 42, 117, 0.45);
                        border-radius: 16px;
                        color: #fcecf2;
                        font-family: var(--font-sans);
                        font-size: 0.95rem;
                        line-height: 1.6;
                        animation: introFadeUp 0.6s ease forwards;
                    ">
                        <div style="font-family: var(--font-mono); color: var(--pink-soft); font-size: 0.8rem; margin-bottom: 8px;">
                            ✦ BOTPRESS INTEGRATION HOOK READY
                        </div>
                        <p style="margin-bottom: 12px;">
                            The AI Twin container is fully primed. Once your <strong>Botpress Webchat script</strong> is pasted in 
                            <code>index.html</code> above <code>&lt;/body&gt;</code>, your custom persona will automatically bind here.
                        </p>
                        <div style="font-size: 0.82rem; color: #c9bccc; font-style: italic;">
                            Ready to answer questions about Piyush's coursework, projects, and engineering trajectory!
                        </div>
                    </div>
                `;
            }
        });
    }

    /* ===================================================================
       9. ONE-CLICK EMAIL COPY TO CLIPBOARD
       =================================================================== */
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const emailText = document.getElementById('emailText');

    if (copyEmailBtn && emailText) {
        copyEmailBtn.addEventListener('click', async () => {
            const email = emailText.textContent.trim();
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(email);
                } else {
                    // Fallback for older browsers
                    const tempInput = document.createElement('input');
                    tempInput.value = email;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                }

                const originalHtml = copyEmailBtn.innerHTML;
                copyEmailBtn.classList.add('copied');
                copyEmailBtn.innerHTML = `<span>✓</span><span>Copied!</span>`;

                setTimeout(() => {
                    copyEmailBtn.classList.remove('copied');
                    copyEmailBtn.innerHTML = originalHtml;
                }, 2400);
            } catch (err) {
                console.warn('Clipboard copy failed:', err);
            }
        });
    }

    /* ===================================================================
       10. SMOOTH SCROLL BACK-TO-TOP & ANCHORS
       =================================================================== */
    const backToTopBtn = document.querySelector('.back-to-top-btn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
