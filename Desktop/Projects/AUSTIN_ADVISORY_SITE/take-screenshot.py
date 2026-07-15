from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)  # Wait for fonts to load
    
    # Scroll through the page to trigger all IntersectionObserver animations
    page.evaluate("""
        // Force all animate-on-scroll elements to be visible
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('visible');
            el.style.transitionDelay = '0s';
        });
    """)
    page.wait_for_timeout(500)
    
    # Full page screenshot
    page.screenshot(path='/Users/Tic/Desktop/Projects/AUSTIN_ADVISORY_SITE/screenshot-full.png', full_page=True)
    
    # Hero section viewport
    page.screenshot(path='/Users/Tic/Desktop/Projects/AUSTIN_ADVISORY_SITE/screenshot-hero.png')
    
    browser.close()
    print("Screenshots saved successfully!")
