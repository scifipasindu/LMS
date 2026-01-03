import { boot } from 'quasar/wrappers'
import { Dark, LocalStorage } from 'quasar'

export default boot(() => {
    // Check if user has a saved preference
    const isDark = LocalStorage.getItem('isDark')

    if (isDark !== null) {
        // Apply saved preference
        Dark.set(isDark)
    } else {
        // Default to auto (system preference)
        Dark.set('auto')
    }
})
