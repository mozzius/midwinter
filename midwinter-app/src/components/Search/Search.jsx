import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

import styles from './Search.module.css'

const Search = ({ onChange }) => {
    const [text, setText] = useState('')
    const debounce = useRef(null)
    const input = useRef(null)

    const textChange = evt => {
        const value = evt.target.value
        setText(value)
        // debouncing search
        debounce.current = setTimeout(() => {
            if (value === input.current.value) onChange(value)
        }, 250)
    }

    // clearing debounce timeout on unmount
    useEffect(() => {
        return () => clearTimeout(debounce.current)
    }, [])

    return (
        <div className={styles.container}>
            <FontAwesomeIcon
                icon={faSearch}
            />
            <input
                ref={input}
                className={styles.box}
                value={text}
                onChange={textChange}
                placeholder="Search"
            />
        </div>
    )
}

export default Search