<script setup lang="ts">
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <h1 class="logo">
        <span class="logo-icon">TS</span>
        <span class="text-gradient">Interview</span>
      </h1>
      <nav>
        <a href="#" class="nav-link active">Home</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: var(--spacing-sm) 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.logo-icon {
  background: var(--accent-primary);
  color: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 1rem;
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-link:hover, .nav-link.active {
  color: var(--text-primary);
}
</style>
