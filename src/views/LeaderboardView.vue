<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import MainLayout from '../shared/layout/MainLayout.vue';
import PageHeader from '../components/common/PageHeader.vue';
import { QuestionStore } from '../services/QuestionStore';
import { UserService } from '../services/UserService';
import type { LeaderboardEntry } from '../shared/types';


const scope = ref<'global' | 'local'>('global');
const isLoading = ref(false);
const globalData = ref<LeaderboardEntry[]>([]);

const loadGlobalLeaderboard = async () => {
  if (scope.value !== 'global') return;
  isLoading.value = true;
  try {
    // Fetch top 50
    globalData.value = await UserService.getLeaderboard(50);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadGlobalLeaderboard();
});

watch(scope, (val) => {
  if (val === 'global') loadGlobalLeaderboard();
});

const leaderboardData = computed(() => {
  if (scope.value === 'global') {
    return globalData.value;
  }

  // Local Scope Aggregation
  // We use QuestionStore.state.examHistory which is local only usually
  const records = [...QuestionStore.state.examHistory];

  // Aggregate Local User Stats (Should just be one user usually, 'You')
  // But logic supports multiple if we wanted.
  const users: Record<string, any> = {};

  records.forEach(r => {
    // Local scope is usually just the current user.
    const name = 'Вы';
    if (!users[name]) {
      users[name] = { username: name, totalScore: 0, bestRuns: {}, testsPassed: 0, totalTime: 0 };
    }

    const user = users[name];
    const uniqueKey = r.title;

    // Best Run Logic
    const currentBest = user.bestRuns[uniqueKey];
    let isBetter = false;
    if (!currentBest || r.score > currentBest.score) isBetter = true;

    if (isBetter) {
      user.bestRuns[uniqueKey] = r;
    }
  });

  // Calculate totals
  return Object.values(users).map((user: any) => {
    let score = 0;
    let time = 0;
    let passed = 0;
    Object.values(user.bestRuns).forEach((run: any) => {
      score += (run.correct || 0);
      time += (run.timeTaken || 0);
      passed++;
    });
    return {
      username: user.username,
      totalScore: score,
      totalTime: time,
      testsPassed: passed
    };
  });
});

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const clearHistory = () => {
  if (confirm('Вы уверены, что хотите очистить историю?')) {
    QuestionStore.state.examHistory = [];
    localStorage.removeItem('quiz_history');
  }
};

const currentUser = ref<any>(null);
const syncError = computed(() => QuestionStore.state.lastSyncError);

onMounted(async () => {
  const { supabase } = await import('../shared/api/supabase');
  const { data } = await supabase.auth.getUser();
  currentUser.value = data.user;
});

const manualSync = async () => {
  await QuestionStore.sync();
  loadGlobalLeaderboard(); // Reload after sync
};
</script>

<template>
  <MainLayout fixed-height>
    <template #header>
      <PageHeader title="🏆 Рейтинг Аркады" description="Накапливай баллы за лучшие прохождения разных тестов!" />
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

        <!-- Hidden Filter Mode for now, or keep if we want to see "Only Exam Points" leaderboard -->
        <!-- 
        <h3>Фильтры баллов</h3>
        <div class="filters-list">
          <button class="filter-btn" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Все</button>
          ...
        </div> 
        -->
      </div>

      <button class="clear-btn" @click="clearHistory" v-if="scope === 'local'">🗑️ Очистить историю</button>
    </template>

    <template #mobile-nav>
      <div class="mobile-controls">
        <div class="scope-toggle mobile-scope">
          <button class="scope-btn" :class="{ active: scope === 'global' }" @click="scope = 'global'">
            🌍 Весь мир
          </button>
          <button class="scope-btn" :class="{ active: scope === 'local' }" @click="scope = 'local'">
            👤 Мои
          </button>
        </div>
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

      <div v-if="leaderboardData.length === 0" class="empty-state">
        <p v-if="scope === 'local'">Нет данных. Пройдите тесты, чтобы набрать баллы!</p>
        <p v-else>Список лидеров пуст или загружается...</p>
      </div>

      <div v-else class="leaderboard-container">
        <!-- Desktop Table View -->
        <div class="table-wrapper desktop-only">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Игрок</th>
                <th>Всего баллов</th>
                <th>Пройдено тестов</th>
                <th>Общее время</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="5" style="text-align: center;">Загрузка данных...</td>
              </tr>
              <tr v-else v-for="(user, index) in leaderboardData" :key="index" :class="{ 'top-record': index < 3 }">
                <td class="rank">
                  <span v-if="index === 0">🥇</span>
                  <span v-else-if="index === 1">🥈</span>
                  <span v-else-if="index === 2">🥉</span>
                  <span v-else>{{ index + 1 }}</span>
                </td>
                <td class="user">
                  <span class="username">{{ user.username }}</span>
                </td>
                <td class="score">
                  {{ user.totalScore }} <span>pts</span>
                </td>
                <td class="title" style="text-align: center;">{{ user.testsPassed || '-' }}</td>
                <td class="time">{{ user.totalTime ? formatTime(user.totalTime) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="mobile-list mobile-only">
          <div v-for="(user, index) in leaderboardData" :key="index" class="record-card"
            :class="{ 'top-record': index < 3 }">
            <div class="card-header">
              <div class="rank-badge">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>#{{ index + 1 }}</span>
              </div>
              <div class="user-info">
                <span class="username">{{ user.username }}</span>
              </div>
              <div class="score-badge">
                {{ user.totalScore }} <span>pts</span>
              </div>
            </div>

            <div class="card-body">
              <div class="stats-row">
                <span>📚 Тестов: {{ user.testsPassed || '-' }}</span>
                <span>⏱️ Время: {{ user.totalTime != null ? formatTime(user.totalTime) : '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped lang="scss">
/* ... existing styles ... */
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

.filters-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.mobile-controls {
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-scope {
  width: 100%;
}

.mobile-filters {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-filters {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 4px;
    /* Scrollbar space */
    margin-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding: 8px 0;
    /* Vertical padding */

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  }

  /* Make filter buttons nicely sized for tap */
  .filter-btn {
    white-space: nowrap;
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.9rem;
  }
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
  margin-top: auto;
  /* Push to bottom of sidebar if flex */

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
  overflow-x: auto;
  /* Ensure table scrolls on mobile */
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  /* Force scroll for wide table logic */

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
  font-weight: 700;
  color: var(--accent-primary);
  font-size: 1.1rem;

  span {
    font-size: 0.8rem;
    font-weight: 400;
    opacity: 0.7;
    margin-left: 2px;
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

/* Mobile Card View Styles */
.mobile-only {
  display: none;
}

.record-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .rank-badge {
    font-size: 1.2rem;
    font-weight: bold;
    min-width: 30px;
  }

  .user-info {
    flex: 1;
    margin-left: 12px;
    display: flex;
    flex-direction: column;

    .username {
      font-weight: 600;
      color: var(--text-primary);
    }

    .date {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  }

  .score-badge {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--accent-primary);

    span {
      font-size: 0.8rem;
      font-weight: 400;
      opacity: 0.7;
    }
  }
}

.card-body {
  .mode-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .topic-name {
      font-size: 0.9rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .stats-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.2);
    padding: 6px 10px;
    border-radius: 6px;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .table-wrapper {
    display: none;
  }
}
</style>
