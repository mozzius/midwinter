import React from 'react'

import styles from './FormContainer.module.css'

const FormContainer = ({ children, logout }) => {
    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <div className={styles.title}>
                    <h2>Midwinter</h2>
                    {logout}
                </div>
                {children}
            </div>
        </div>
    )
}

export default FormContainer