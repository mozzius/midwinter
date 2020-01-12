import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useCreateServer } from '../../hooks/network'
import Pill from '../Pill'
import { Text, Submit } from '../Input'
import styles from './CreateServer.module.css'
import { Checkbox } from '../Input/Input'
import FormContainer from '../FormContainer'

const CreateServer = ({ setServer, setMode }) => {
    const [form, setForm] = useState({ name: '', code: '', invite_only: false })
    const [submit, setSubmit] = useState(null)
    const [error, setError] = useState(false)
    const { type, data } = useCreateServer(submit)

    const strData = JSON.stringify(data)

    useEffect(() => {
        setError(false)
        const res = JSON.parse(strData)

        if (type === 'success') {
            setSubmit(null)
            if (res.success) {
                setServer(res.server)
            } else {
                setError(true)
            }
        } else if (type === 'error' && res !== 'no message') {
            setError(true)
        }
    }, [type, strData, setServer])

    return (
        <FormContainer logout={(
            <Pill right white>
                <Link to="/logout">Log out</Link>
            </Pill>
        )}>
            <div className={styles.title}>
                <p>Create a Server</p>
                <Pill white onClick={() => setMode('select server')}>Go back</Pill>
            </div>
            {error && <p>Error creating server</p>}
            <form onSubmit={evt => {
                evt.preventDefault()
                if (form.name !== '' && form.code !== '') setSubmit(form)
            }}>
                <Text
                    label="Server Name"
                    placeholder="Midwinter Server"
                    autoFocus
                    value={form.name}
                    onChange={evt => setForm({ ...form, name: evt.target.value })}
                />
                <Text
                    label="Server Code (for joining - something short and memorable)"
                    placeholder="MIDWINTER"
                    monospace
                    value={form.code}
                    onChange={evt => setForm({ ...form, code: evt.target.value.replace(/\W/g, '').toUpperCase() })}
                />
                <Checkbox
                    label="Invite only"
                    value={form.invite_only}
                    onChange={() => setForm({ ...form, invite_only: !form.invite_only })}
                />
                <Submit
                    text="Create Server"
                />
            </form>
        </FormContainer>
    )
}

export default CreateServer