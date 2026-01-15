<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import MainLayout from '../components/layout/MainLayout.vue';
import PageHeader from '../components/common/PageHeader.vue';
import { QuestionStore } from '../services/QuestionStore';

const filterMode = ref<'all' | 'exam' | 'category'>('all');
const scope = ref<'global' | 'local'>('global');

onMounted(() => {
  // Store handles loading and syncing
});

const filteredRecords = computed(() => {
  let records = scope.value === 'global'
    ? [...QuestionStore.state.globalLeaderboard]
    : [...QuestionStore.state.examHistory];

  if (filterMode.value !== 'all') {
    records = records.filter(r => r.mode === filterMode.value);
  }

  // Sort by score (desc) then date (desc)
  return records.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const clearHistory = () => {
  if (confirm('Вы уверены, что хотите очистить историю?')) {
    QuestionStore.state.examHistory = [];
    localStorage.removeItem('quiz_history'); // Legacy cleanup
    // Ideally we should have a QuestionStore.clearHistory() that also deletes from DB?
    // For now, local clear is safer to avoid accidental bulk delete
  }
};

const currentUser = ref<any>(null);
const syncError = computed(() => QuestionStore.state.lastSyncError);

onMounted(async () => {
  const { supabase } = await import('../services/supabase');
  const { data } = await supabase.auth.getUser();
  currentUser.value = data.user;
});

const manualSync = async () => {
  console.log('Manual sync triggered...');
  await QuestionStore.sync();
};
</script>

<template>
  <MainLayout>
    <template #header>
      <PageHeader title="🏆 Таблица рекордов" description="Твои лучшие результаты и история прохождений." />
    </template>

    <template #sidebar>
      <div class="filters-card">
        <h3>Источник</h3>
        <div class="scope-toggle">
          <button class="scope-btn" :class="{ active: scope === 'global' }" @click="scope = 'global'">
            🌍 Весь мир
          </button>
          <button class="scope-btn" :class="{ active: scope === 'local' }" @click="scope = 'local'">
            👤 Мои
          </button>
        </div>

        <h3>Фильтры</h3>
        <div class="filters-list">
          <button class="filter-btn" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">
            Все
          </button>
          <button class="filter-btn" :class="{ active: filterMode === 'exam' }" @click="filterMode = 'exam'">
            Экзамены
          </button>
          <button class="filter-btn" :class="{ active: filterMode === 'category' }" @click="filterMode = 'category'">
            Категории
          </button>
        </div>
      </div>

      <button class="clear-btn" @click="clearHistory" v-if="scope === 'local'">🗑️ Очистить историю</button>
    </template>

    <template #mobile-nav>
      <div class="mobile-filters">
        <button class="filter-btn" :class="{ active: scope === 'global' }" @click="scope = 'global'">🌍</button>
        <button class="filter-btn" :class="{ active: scope === 'local' }" @click="scope = 'local'">👤</button>
        <div class="divider"></div>
        <button class="filter-btn" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Все</button>
        <button class="filter-btn" :class="{ active: filterMode === 'exam' }"
          @click="filterMode = 'exam'">Экзамены</button>
        <button class="filter-btn" :class="{ active: filterMode === 'category' }"
          @click="filterMode = 'category'">Категории</button>
      </div>
    </template>

    <template #content>
      <div v-if="!currentUser && scope === 'global'" class="debug-info">
        <span>⚠️ Вы не вошли в систему. Глобальные рекорды недоступны.</span>
      </div>
      <div v-if="syncError" class="debug-info">
        <span>⚠️ Ошибка синхронизации: {{ syncError }}</span>
        <button class="sync-btn" @click="manualSync">Повторить</button>
      </div>

      <div class="debug-info" v-if="scope === 'local' || scope === 'global'">
        <span>Локальные записи: {{ QuestionStore.state.examHistory.length }}</span>
      </div>

      <div v-if="filteredRecords.length === 0" class="empty-state">
        <p v-if="scope === 'local'">Пока нет записей. Пройдите тест или экзамен!</p>
        <p v-else>Список лидеров пуст или загружается...</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Игрок</th>
              <th>Дата</th>
              <th>Режим</th>
              <th>Тема</th>
              <th>Результат</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in filteredRecords" :key="index" :class="{ 'top-record': index < 3 }">
              <td class="rank">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </td>
              <td class="user">
                <span class="username">
                  {{ record.username || (scope === 'local' ? 'Вы' : 'Аноним') }}
                </span>
              </td>
              <td class="date">{{ formatDate(record.date) }}</td>
              <td class="mode">
                <span class="badge" :class="record.mode">
                  {{ record.mode === 'exam' ? 'Экзамен' : (record.mode === 'category' ? 'Категория' : 'Тема') }}
                </span>
              </td>
              <td class="title">{{ record.title }}</td>
              <td class="score">
                <span :class="{
                  'good': record.score >= 80,
                  'avg': record.score >= 50 && record.score < 80,
                  'bad': record.score < 50
                }">
                  {{ record.score }}%
                </span>
                <span class="details">({{ record.correct }}/{{ record.total }})</span>
              </td>
              <td class="time">{{ formatTime(record.timeTaken) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped lang="scss">
h2 {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  font-size: 2rem;
}

.debug-info {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sync-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 8px;
  
  &:hover {
    background: var(--bg-card);
  }
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 8px;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: var(--accent-primary);
    color: white;
  }
}

.clear-btn {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: var(--bg-card);
  border-radius: 16px;
  color: var(--text-secondary);
  border: 1px dashed var(--border-color);
}

.table-wrapper {
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background: rgba(255, 255, 255, 0.05);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.rank {
  font-weight: bold;
  font-size: 1.1rem;
  width: 60px;
  text-align: center;
}

.date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.mode {
  width: 120px;
}

.title {
  font-weight: 500;
  color: var(--text-primary);
}

.score {
  font-family: 'Fira Code', monospace;
  font-weight: 700;

  .good {
    color: #22c55e;
  }

  .avg {
    color: #f59e0b;
  }

  .bad {
    color: #ef4444;
  }

  .details {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-left: 4px;
    font-weight: normal;
  }
}

.time {
  font-family: 'Fira Code', monospace;
  color: var(--text-secondary);
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  &.exam {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }

  &.category {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
  }

  &.topic {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
}

.top-record {
  background: rgba(255, 255, 255, 0.02);
}

.scope-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.scope-btn {
  flex: 1;
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
  }
}

.user {
  font-weight: 600;
  color: var(--text-primary);

  .username {
    display: block;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
