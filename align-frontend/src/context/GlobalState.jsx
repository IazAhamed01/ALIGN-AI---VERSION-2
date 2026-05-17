import { createContext, useContext, useReducer, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Initial State
const initialState = {
    crop: 'TOMATO',
    region: 'DIST001',
    farmerInputs: [],
    storageFacilities: [],
    dashboardResult: null,
    systemSummary: null,
    uiStatus: {
        loading: false,
        error: null,
        lastUpdated: null,
        dashboardStale: true
    }
}

// Action Types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SYSTEM_SUMMARY: 'SET_SYSTEM_SUMMARY',
    SET_FARMERS: 'SET_FARMERS',
    SET_STORAGE: 'SET_STORAGE',
    SET_DASHBOARD_RESULT: 'SET_DASHBOARD_RESULT',
    INVALIDATE_DASHBOARD: 'INVALIDATE_DASHBOARD',
    CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
function globalReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return {
                ...state,
                uiStatus: { ...state.uiStatus, loading: action.payload }
            }
        case ACTIONS.SET_ERROR:
            return {
                ...state,
                uiStatus: { ...state.uiStatus, error: action.payload, loading: false }
            }
        case ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                uiStatus: { ...state.uiStatus, error: null }
            }
        case ACTIONS.SET_SYSTEM_SUMMARY:
            return {
                ...state,
                systemSummary: action.payload,
                uiStatus: { ...state.uiStatus, loading: false }
            }
        case ACTIONS.SET_FARMERS:
            return {
                ...state,
                farmerInputs: action.payload,
                uiStatus: { ...state.uiStatus, dashboardStale: true }
            }
        case ACTIONS.SET_STORAGE:
            return {
                ...state,
                storageFacilities: action.payload
            }
        case ACTIONS.SET_DASHBOARD_RESULT:
            return {
                ...state,
                dashboardResult: action.payload,
                uiStatus: {
                    ...state.uiStatus,
                    loading: false,
                    lastUpdated: new Date().toISOString(),
                    dashboardStale: false
                }
            }
        case ACTIONS.INVALIDATE_DASHBOARD:
            return {
                ...state,
                uiStatus: { ...state.uiStatus, dashboardStale: true }
            }
        default:
            return state
    }
}

// Context
const GlobalStateContext = createContext(null)

// Provider
export function GlobalStateProvider({ children }) {
    const [state, dispatch] = useReducer(globalReducer, initialState)

    // API Functions
    const fetchSystemSummary = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        try {
            const res = await fetch(`${API_BASE}/api/data/summary`)
            const data = await res.json()
            if (data.success) {
                dispatch({ type: ACTIONS.SET_SYSTEM_SUMMARY, payload: data.data })
            }
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load system summary' })
        }
    }, [])

    const fetchFarmers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/data/farmers`)
            const data = await res.json()
            if (data.success) {
                dispatch({ type: ACTIONS.SET_FARMERS, payload: data.data.farmers })
            }
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load farmers' })
        }
    }, [])

    const fetchStorage = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/data/storage`)
            const data = await res.json()
            if (data.success) {
                dispatch({ type: ACTIONS.SET_STORAGE, payload: data.data })
            }
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load storage' })
        }
    }, [])

    const runCoordination = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        dispatch({ type: ACTIONS.CLEAR_ERROR })
        try {
            const res = await fetch(`${API_BASE}/api/forecast/dashboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop: state.crop,
                    region: state.region
                })
            })
            const data = await res.json()
            if (data.success) {
                dispatch({ type: ACTIONS.SET_DASHBOARD_RESULT, payload: data.data })
            } else {
                dispatch({ type: ACTIONS.SET_ERROR, payload: data.error || 'Coordination failed' })
            }
        } catch (err) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to run coordination' })
        }
    }, [state.crop, state.region])

    const invalidateDashboard = useCallback(() => {
        dispatch({ type: ACTIONS.INVALIDATE_DASHBOARD })
    }, [])

    const clearError = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_ERROR })
    }, [])

    const value = {
        state,
        dispatch,
        fetchSystemSummary,
        fetchFarmers,
        fetchStorage,
        runCoordination,
        invalidateDashboard,
        clearError
    }

    return (
        <GlobalStateContext.Provider value={value}>
            {children}
        </GlobalStateContext.Provider>
    )
}

// Hook
export function useGlobalState() {
    const context = useContext(GlobalStateContext)
    if (!context) {
        throw new Error('useGlobalState must be used within GlobalStateProvider')
    }
    return context
}
