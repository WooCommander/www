<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  onRefresh?: () => Promise<void> | void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const isPulling = ref(false);
const isRefreshing = ref(false);
const pullDistance = ref(0);
const threshold = 70; // px to trigger refresh
let startY = 0;

const handleTouchStart = (e: TouchEvent) => {
  if (window.scrollY === 0 && !isRefreshing.value) {
    startY = e.touches[0].clientY;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (startY === 0 || isRefreshing.value) return;
  
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;
  
  // Only handle pull down when at top
  if (deltaY > 0 && window.scrollY <= 0) {
    // Add resistance
    pullDistance.value = Math.min(deltaY * 0.5, 150);
    
    if (pullDistance.value > 0) {
      isPulling.value = true;
      // Prevent default scrolling only if we are effectively pulling
      if (e.cancelable && pullDistance.value > 10) e.preventDefault();
    }
  }
};

const handleTouchEnd = async () => {
  if (!isPulling.value || isRefreshing.value) {
    startY = 0;
    return;
  }

  if (pullDistance.value >= threshold) {
    isRefreshing.value = true;
    pullDistance.value = threshold; // Snap to threshold
    
    try {
      if (props.onRefresh) {
        await props.onRefresh();
      } else {
        // Default behavior: reload page
        window.location.reload();
      }
    } finally {
      // Small delay to show completion
      setTimeout(() => {
        isRefreshing.value = false;
        pullDistance.value = 0;
        isPulling.value = false;
      }, 500);
    }
  } else {
    // Snap back
    pullDistance.value = 0;
    isPulling.value = false;
  }
  
  startY = 0;
};

onMounted(() => {
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd);
});

onUnmounted(() => {
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
});
</script>

<template>
  <div ref="containerRef" class="pull-to-refresh-container">
    <div 
      class="refresh-indicator"
      :style="{ 
        transform: `translateY(${pullDistance}px)`,
        opacity: pullDistance > 0 ? 1 : 0
      }"
    >
      <div v-if="isRefreshing" class="spinner"></div>
      <div v-else class="icon" :style="{ transform: `rotate(${pullDistance * 2}deg)` }">
        ⬇️
      </div>
    </div>
    
    <div 
      class="content-wrapper"
      :style="{ transform: `translateY(${pullDistance}px)` }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.pull-to-refresh-container {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.refresh-indicator {
  position: absolute;
  top: -50px; /* Hide above content initially */
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease-out, opacity 0.2s;
  z-index: 10;
  pointer-events: none;
}

.content-wrapper {
  transition: transform 0.2s ease-out;
  /* Ensure it doesn't break layout */
  width: 100%; 
  height: 100%;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color, #4facfe);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.icon {
  font-size: 20px;
  transition: transform 0.2s;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
