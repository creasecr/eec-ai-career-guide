const statNumbers = document.querySelectorAll(".stat strong[data-value]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formatNumber = (value, targetText) => {
    const formatted = Math.round(value).toLocaleString("en-US");
    return targetText.endsWith("%") ? `${formatted}%` : formatted;
};

const animateStat = (statNumber) => {
    const target = Number(statNumber.dataset.value);
    const targetText = statNumber.textContent.trim();

    if (!Number.isFinite(target)) {
        return;
    }

    if (prefersReducedMotion) {
        statNumber.textContent = formatNumber(target, targetText);
        return;
    }

    const duration = 1400;
    const startTime = performance.now();

    const update = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        statNumber.textContent = formatNumber(target * easedProgress, targetText);

        if (progress < 1) {
            window.requestAnimationFrame(update);
        }
    };

    statNumber.textContent = formatNumber(0, targetText);
    window.requestAnimationFrame(update);
};

if (statNumbers.length) {
    const statsSection = document.querySelector(".stats");

    if (statsSection && "IntersectionObserver" in window) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                statNumbers.forEach(animateStat);
                observer.disconnect();
            }
        }, { threshold: 0.25 });

        statsObserver.observe(statsSection);
    } else {
        statNumbers.forEach(animateStat);
    }
}
