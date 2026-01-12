<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface QuizResult {
    id: string;
    date: string; // ISO string
    score: number; // percentage
    correct: number;
    total: number;
    timeTaken: number; // seconds
    mode: 'exam' | 'category' | 'topic';
    title: string;
}

const records = ref<QuizResult[]>([]);
const filterMode = ref<'all' | 'exam' | 'category'>('all');

onMounted(() => {
    const saved = localStorage.getItem('quiz_records');
    if (saved) {
        try {
            records.value = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse records', e);
        }
    }
});

const filteredRecords = computed(() => {
    let list = records.value;
    if (filterMode.value !== 'all') {
        list = list.filter(r => r.mode === filterMode.value);
    }
    // Sort: Score Desc, then Time Asc, then Date Desc
    return list.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
});

const formatTime = (seconds: number) => {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString() + ' ' + new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

const clearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить всю историю?')) {
        records.value = [];
        localStorage.removeItem('quiz_records');
    }
};
</script>

<template>
    <main class="container leaderboard-container">
        <h2>🏆 Таблица рекордов</h2>

        <div class="controls">
            <div class="filters">
                <button 
                    class="filter-btn" 
                    :class="{ active: filterMode === 'all' }"
                    @click="filterMode = 'all'"
                >
                    Все
                </button>
                <button 
                    class="filter-btn" 
                    :class="{ active: filterMode === 'exam' }"
                    @click="filterMode = 'exam'"
                >
                    Экзамены
                </button>
                <button 
                    class="filter-btn" 
                    :class="{ active: filterMode === 'category' }"
                    @click="filterMode = 'category'"
                >
                    Категории
                </button>
            </div>
            <button class="clear-btn" @click="clearHistory">🗑️ Очистить</button>
        </div>

        <div v-if="filteredRecords.length === 0" class="empty-state">
            <p>Пока нет записей. Пройдите тест или экзамен!</p>
        </div>

        <div v-else class="table-wrapper">
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>#</th>
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
    </main>
</template>

<style scoped>
.leaderboard-container {
    padding-top: var(--spacing-xl);
    max-width: 900px;
}

h2 {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    font-size: 2rem;
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
}

.filter-btn.active {
    background: var(--accent-primary);
    color: white;
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
}

.clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
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
}

.leaderboard-table th, .leaderboard-table td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.leaderboard-table th {
    background: rgba(255, 255, 255, 0.05);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
}

.leaderboard-table tr:last-child td {
    border-bottom: none;
}

.rank { font-weight: bold; font-size: 1.1rem; width: 60px; text-align: center; }
.date { color: var(--text-secondary); font-size: 0.9rem; }
.mode { width: 120px; }
.title { font-weight: 500; color: var(--text-primary); }
.score { font-family: 'Fira Code', monospace; font-weight: 700; }
.time { font-family: 'Fira Code', monospace; color: var(--text-secondary); }

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}
.badge.exam { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge.category { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.badge.topic { background: rgba(16, 185, 129, 0.2); color: #10b981; }

.score .good { color: #22c55e; }
.score .avg { color: #f59e0b; }
.score .bad { color: #ef4444; }
.score .details { font-size: 0.8rem; color: var(--text-secondary); margin-left: 4px; font-weight: normal; }

.top-record {
    background: rgba(255, 255, 255, 0.02);
}
</style>
