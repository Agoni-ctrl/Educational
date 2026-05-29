<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 30
  },
  enabled: {
    type: Boolean,
    default: true
  },
  cursor: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['complete', 'typing']);

const displayText = ref('');
const isTyping = ref(false);
const isComplete = ref(false);
const hasStarted = ref(false);

const startTyping = async () => {
  // 防止重复执行
  if (hasStarted.value || isTyping.value) return;
  
  hasStarted.value = true;
  
  if (!props.enabled) {
    displayText.value = props.text;
    isComplete.value = true;
    emit('complete');
    return;
  }

  isTyping.value = true;
  isComplete.value = false;
  displayText.value = '';

  const chars = props.text.split('');
  
  for (let i = 0; i < chars.length; i++) {
    await new Promise(resolve => setTimeout(resolve, props.speed));
    displayText.value += chars[i];
    
    if (i % 5 === 0) {
      emit('typing');
    }
  }

  isTyping.value = false;
  isComplete.value = true;
  emit('complete');
};

// 只在 text 变化且未开始时执行
watch(() => props.text, (newText) => {
  if (newText && !hasStarted.value) {
    startTyping();
  }
}, { immediate: false });

onMounted(() => {
  if (props.text && !hasStarted.value) {
    startTyping();
  }
});
</script>

<template>
  <span class="typewriter-text">
    {{ displayText }}
    <span v-if="cursor && !isComplete" class="typewriter-cursor">|</span>
  </span>
</template>

<style scoped>
.typewriter-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: var(--color-primary);
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
