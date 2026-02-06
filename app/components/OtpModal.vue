<template>
    <Teleport to="body">
        <Transition name="otp-modal">
            <div v-if="isOpen" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">Verify Your Email</h2>
                    </div>
                    <div class="modal-body">
                        <p class="modal-description">
                            We've sent a verification code to your email address. Please enter the 6-digit code below.
                        </p>
                        <div class="otp-inputs">
                            <input
                                v-for="(digit, index) in otpDigits"
                                :key="index"
                                :ref="(el) => (inputRefs[index] = el)"
                                v-model="otpDigits[index]"
                                type="text"
                                inputmode="numeric"
                                maxlength="1"
                                class="otp-input"
                                :class="{ 'has-error': errorMessage }"
                                @input="handleInput(index, $event)"
                                @keydown="handleKeyDown(index, $event)"
                                @paste="handlePaste"
                            />
                        </div>
                        <div v-if="errorMessage" class="error-message">
                            <Icon name="carbon:warning" size="16" />
                            <span>{{ errorMessage }}</span>
                        </div>
                        <button
                            type="button"
                            :disabled="!isOtpComplete || isLoading"
                            class="submit-btn"
                            @click="handleSubmit"
                        >
                            <span v-if="!isLoading">Submit</span>
                            <span v-else class="loading-state">
                                <Icon name="carbon:circle-dash" class="animate-spin" size="20" />
                                Verifying...
                            </span>
                        </button>
                        <button type="button" :disabled="isResending" class="resend-btn" @click="handleResendCode">
                            <span v-if="!isResending">Get code again</span>
                            <span v-else class="loading-state">
                                <Icon name="carbon:circle-dash" class="animate-spin" size="16" />
                                Sending...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['submit', 'resend']);
const otpDigits = ref(['', '', '', '', '', '']);
const inputRefs = ref([]);
const errorMessage = ref('');
const isLoading = ref(false);
const isResending = ref(false);
const isOtpComplete = computed(() => {
    return otpDigits.value.every((digit) => digit !== '');
});
const otpCode = computed(() => {
    return otpDigits.value.join('');
});
const handleInput = (index, event) => {
    const value = event.target.value;
    if (value && !/^\d$/.test(value)) {
        otpDigits.value[index] = '';
        return;
    }
    if (errorMessage.value) {
        errorMessage.value = '';
    }
    if (value && index < 5) {
        inputRefs.value[index + 1]?.focus();
    }
};
const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
        if (!otpDigits.value[index] && index > 0) {
            inputRefs.value[index - 1]?.focus();
        }
    } else if (event.key === 'ArrowLeft' && index > 0) {
        inputRefs.value[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
        inputRefs.value[index + 1]?.focus();
    }
};
const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
        const digits = pastedData.split('');
        otpDigits.value = digits;
        inputRefs.value[5]?.focus();
        errorMessage.value = '';
    }
};
const handleSubmit = async () => {
    if (!isOtpComplete.value) return;
    isLoading.value = true;
    errorMessage.value = '';
    try {
        await emit('submit', otpCode.value);
    } catch (error) {
        errorMessage.value = error.message || 'Verification failed. Please try again.';
    } finally {
        isLoading.value = false;
    }
};
const handleResendCode = async () => {
    isResending.value = true;
    errorMessage.value = '';
    try {
        await emit('resend');
        otpDigits.value = ['', '', '', '', '', ''];
        nextTick(() => {
            inputRefs.value[0]?.focus();
        });
    } catch (error) {
        errorMessage.value = error.message || 'Failed to resend code. Please try again.';
    } finally {
        isResending.value = false;
    }
};
const resetForm = () => {
    otpDigits.value = ['', '', '', '', '', ''];
    errorMessage.value = '';
    isLoading.value = false;
    isResending.value = false;
};
const setError = (message) => {
    errorMessage.value = message;
};
watch(
    () => props.isOpen,
    (newVal) => {
        if (newVal) {
            resetForm();
            nextTick(() => {
                inputRefs.value[0]?.focus();
            });
        }
    },
);
defineExpose({
    setError,
});
</script>
<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
}
.modal-container {
    background: white;
    border-radius: 16px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 480px;
    overflow: hidden;
}
.modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    border-bottom: 1px solid var(--surface-200);
}
.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0;
}
.modal-body {
    padding: 32px 24px 24px;
}
.modal-description {
    text-align: center;
    color: var(--surface-600);
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 32px;
}
.otp-inputs {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 24px;
}
.otp-input {
    width: 56px;
    height: 56px;
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    border: 2px solid var(--surface-200);
    border-radius: 12px;
    background: var(--surface-0);
    color: var(--surface-900);
    transition: all 0.2s ease;
    outline: none;
}
.otp-input:focus {
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.otp-input.has-error {
    border-color: #ef4444;
}
.otp-input.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 14px;
    margin-bottom: 24px;
}
.submit-btn {
    width: 100%;
    padding: 12px 24px;
    background: var(--primary-600);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 12px;
}
.submit-btn:hover:not(:disabled) {
    background: var(--primary-700);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.submit-btn:active:not(:disabled) {
    transform: translateY(0);
}
.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.resend-btn {
    width: 100%;
    padding: 10px 24px;
    background: transparent;
    color: var(--primary-600);
    border: 1px solid var(--primary-200);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}
.resend-btn:hover:not(:disabled) {
    background: var(--primary-50);
    border-color: var(--primary-300);
}
.resend-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.otp-modal-enter-active {
    transition: opacity 0.3s ease;
}
.otp-modal-leave-active {
    transition: opacity 0.2s ease;
}
.otp-modal-enter-active .modal-container {
    animation: slideDownBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.otp-modal-leave-active .modal-container {
    animation: slideUp 0.2s ease;
}
.otp-modal-enter-from,
.otp-modal-leave-to {
    opacity: 0;
}
@keyframes slideDownBounce {
    0% {
        transform: translateY(-100%);
        opacity: 0;
    }
    60% {
        transform: translateY(10px);
    }
    80% {
        transform: translateY(-5px);
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}
@keyframes slideUp {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(-20px);
        opacity: 0;
    }
}
@media (max-width: 640px) {
    .otp-inputs {
        gap: 8px;
    }
    .otp-input {
        width: 48px;
        height: 48px;
        font-size: 20px;
    }
}
</style>
