import React from 'react'

import styles from './Bar.module.css'

const Bar = ({ text, children }) => {
    return (
        <div className={styles.bar}>
            <p>{text}</p>
            {children}
        </div>
    )
}

export default Bar