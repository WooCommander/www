<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  block: false,
  disabled: false,
  type: 'button'
});

const classes = computed(() => {
  return [
    'base-btn',
    `variant-${props.variant}`,
    `size-${props.size}`,
    { 'is-loading': props.loading },
    { 'is-block': props.block }
  ];
});
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <span v-if="loading" class="spinner"></span>
    <span v-else class="content">
      <slot name="icon-left"></slot>
      <slot></slot>
      <slot name="icon-right"></slot>
    </span>
  </button>
</template>

<style scoped lang="scss">
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.is-block {
    width: 100%;
  }
}

/* Variants */
.variant-primary {
  background: var(--accent-primary);
  color: white;

  &:not(:disabled):hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 12px var(--accent-glow);
  }
}

.variant-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:not(:disabled):hover {
    border-color: var(--accent-primary);
    background: var(--bg-secondary);
  }
}

.variant-outline {
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);

  &:not(:disabled):hover {
    background: rgba(56, 189, 248, 0.1);
  }
}

.variant-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);

  &:not(:disabled):hover {
    background: rgba(239, 68, 68, 0.2);
  }
}

.variant-ghost {
  background: transparent;
  color: var(--text-secondary);

  &:not(:disabled):hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
}

/* Sizes */
.size-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.size-md {
  padding: 10px 20px;
  font-size: 1rem;
}

.size-lg {
  padding: 14px 28px;
  font-size: 1.125rem;
}

/* Spinner */
.spinner {
  width: 1.2em;
  height: 1.2em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
