<script setup lang="ts">

interface Props {
    modelValue: string | number;
    label?: string;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    minlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    modelValue: '',
    required: false
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};
</script>

<template>
    <div class="base-input-wrapper">
        <label v-if="label" class="label">
            {{ label }} <span v-if="required" class="required">*</span>
        </label>

        <input :type="type" :value="modelValue" :placeholder="placeholder" :required="required" :minlength="minlength"
            class="base-input" :class="{ 'has-error': error }" @input="updateValue" />

        <span v-if="error" class="error-msg">{{ error }}</span>
    </div>
</template>

<style scoped lang="scss">
.base-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
}

.label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;

    .required {
        color: var(--accent-primary);
    }
}

.base-input {
    padding: 12px;
    border-radius: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: 1rem;
    transition: all 0.2s ease;
    width: 100%;

    &:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px var(--accent-glow);
    }

    &.has-error {
        border-color: #ef4444;
    }
}

.error-msg {
    font-size: 0.85rem;
    color: #ef4444;
}
</style>
