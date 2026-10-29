// Lesson 08 练习 · 自定义 Hook
// 你只需要修改这个文件。三个 Hook 的签名、参数与返回值契约
// 见 lesson-08/README.md 第 10 节；Exercise.jsx 已经接好线，不要改动。
//
// 提示：需要时从 react 引入 useState / useEffect。

// TODO(核心 1): 初始值用 navigator.onLine，订阅 online / offline，cleanup 移除监听。
// 返回值：boolean
import {useEffect, useState} from "react";

export function useOnlineStatus() {
    const [online, setOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }

    }, []);

    return online
}

// TODO(核心 2): 从 start 开始，每隔 interval 毫秒 +1，interval 变化或卸载时清理定时器。
// 返回值：number
export function useBlockHeight(start, interval) {
    const [height, setHeight] = useState(start)

    useEffect(() => {
        const id = setInterval(() => {
            setHeight((current) => current + 1)
        }, interval)

        return () => clearInterval(id)
    }, [interval])

    return height
}

// TODO(核心 3): value 变化后延迟 delay 毫秒再返回新值，期间再次变化要重置计时。
// 返回值：延迟后的 value
export function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay)

        return () => clearTimeout(id)
    }, [value, delay])

    return debounced
}
