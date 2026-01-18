<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md'
});

const classes = computed(() => {
  return [
    'base-card',
    `padding-${props.padding}`
  ];
});
</script>

<template>
  <div :class="classes">
    <div v-if="title || $slots.header" class="card-header">
      <h3 v-if="title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    /* Optional hover effect */
  }

  /* Padding Variants */
  &.padding-none .card-body {
    padding: 0;
  }

  &.padding-sm .card-body {
    padding: 12px;
  }

  &.padding-md .card-body {
    padding: 20px;
  }

  &.padding-lg .card-body {
    padding: 32px;
  }
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}
</style>
