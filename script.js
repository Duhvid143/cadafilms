document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('hero-video');
    const scrollContainer = document.getElementById('scroll-container');
    
    // Ensure the video metadata is loaded before trying to access duration
    // Also trigger initial load to make sure duration populates
    video.load();
    
    // We use a manual requestAnimationFrame loop for smoother 60fps scrubbing
    // rather than doing it directly inside the scroll handler
    let targetTime = 0;
    
    // Lerp (Linear Interpolation) for buttery smooth "catchup" scrubbing
    // A factor near 1 is fast, a factor near 0 is slow. 0.1 is very smooth.
    const ease = 0.08; 
    
    function renderLoop() {
        // Double check duration exists safely
        if (video.readyState >= 1 && video.duration > 0) {
            // Calculate progress based on scroll position vs maximum scrollable distance
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            
            // Protect against dividing by zero
            if (maxScroll > 0) {
                // Determine raw scroll progress (0.0 to 1.0)
                let scrollProgress = window.scrollY / maxScroll;
                
                // Clamp it between 0 and 1
                scrollProgress = Math.max(0, Math.min(1, scrollProgress));
                
                // Target time is scaled to the video duration
                const rawTargetTime = scrollProgress * video.duration;
                
                // Apply easing: smoothly move targetTime closer to rawTargetTime
                targetTime += (rawTargetTime - targetTime) * ease;
                
                // Only update the video currentTime if the difference is noticeable
                // AND critically, wait until the video is NOT already seeking to prevent
                // the browser from freezing due to cancelled rapid seeks.
                if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.01) {
                    video.currentTime = targetTime;
                }
            }
        }
        
        requestAnimationFrame(renderLoop);
    }
    
    // Kick off the loop
    requestAnimationFrame(renderLoop);

    // Handle real form submission via Firebase Cloud Function
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.btn-send');
        const originalText = btn.textContent;
        
        btn.textContent = 'Sending...';
        btn.style.opacity = '0.7';
        btn.disabled = true;
        
        const inputs = form.querySelectorAll('input, textarea');
        const data = {
            name: inputs[0].value,
            email: inputs[1].value,
            message: inputs[2].value
        };

        try {
            // NOTE: In production, this URL must be updated to your deployed Google Cloud Function URL
            const functionUrl = "https://us-east1-cada-f5b39.cloudfunctions.net/submitContactForm";
            
            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error("Failed to send message.");
            }
            
            // Success
            btn.textContent = 'Sent!';
            btn.style.background = '#4CAF50';
            btn.style.color = 'white';
            btn.style.opacity = '1';
            form.reset();
            
        } catch (error) {
            console.error("Submission error:", error);
            // Error
            btn.textContent = 'Failed';
            btn.style.background = '#f44336';
            btn.style.color = 'white';
            btn.style.opacity = '1';
        }

        // Reset button state after 3 seconds
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#fff';
            btn.style.color = '#000';
            btn.disabled = false;
        }, 3000);
    });
});
