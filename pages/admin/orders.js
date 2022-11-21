import React from 'react'

export default function AdminOrderScreen() {

    const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
        loading: true,
        orders: [],
        error: '',
    })
  return (
    <div>
      
    </div>
  )
}

AdminOrderScreen.auth = { adminOnly: true }