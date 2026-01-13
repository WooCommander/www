import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
            updateSW(true)
        }
    },
    onRegisterError(error) {
        console.error('SW Error:', error);
        // alert('SW Error: ' + error); // Uncomment for debugging on mobile
    },
    onRegistered(r) {
        console.log('SW Registered:', r);
        // alert('SW Registered! Ready for offline.'); // Uncomment for debugging on mobile
    }
})

import router from './router'

createApp(App)
    .use(router)
    .mount('#app')
