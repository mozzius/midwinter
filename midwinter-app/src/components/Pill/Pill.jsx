import React from 'react'

import styles from './Pill.module.css'

const Pill = ({ children, white, right, onClick }) => {
    return (
        <>
            {right && <div className={styles.grow} />}
            <div
                className={styles.pill}
                style={white && { backgroundColor: 'white' }}
                onClick={onClick}
            >
                {children}
            </div>
        </>
    )
}

export default Pill