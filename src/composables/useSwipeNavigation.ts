import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export function useSwipeNavigation() {
    const router = useRouter();

    // Configuration
    const EDGE_THRESHOLD = 30; // px from left edge to start swipe
    const SWIPE_THRESHOLD = 100; // px to trigger back action

    let touchStartX = 0;
    let touchStartY = 0;
    let isEdgeSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        if (!touch) return;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        // Only verify if strictly from the left edge
        if (touchStartX <= EDGE_THRESHOLD) {
            isEdgeSwipe = true;
        } else {
            isEdgeSwipe = false;
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!isEdgeSwipe) return;
        if (e.changedTouches.length === 0) return;

        const touch = e.changedTouches[0];
        if (!touch) return;

        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // Ensure it's mostly horizontal swipe
        if (deltaX > SWIPE_THRESHOLD && deltaY < deltaX * 0.5) {
            router.back();
        }

        // Reset
        isEdgeSwipe = false;
    };

    onMounted(() => {
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
    });

    onUnmounted(() => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    });
}
