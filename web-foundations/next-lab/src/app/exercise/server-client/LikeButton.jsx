'use client'

import {useState} from 'react'

export default function LikeButton() {
    const [count, setCount] = useState(0)

    return (
        <div>
            <p>点赞数：{count}</p>
            <button
                className="button"
                type="button"
                onClick={() => setCount((current) => current + 1)}
            >
                点赞 +1
            </button>
        </div>
    )
}
