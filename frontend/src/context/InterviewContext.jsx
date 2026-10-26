import React, { createContext, useContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api.js'

const InterviewContext = createContext(null)

export function InterviewProvider({ children }) {
  const [currentInterview, setCurrentInterview] = useState(null)
  const [currentSession, setCurrentSession] = useState(null)
  const [answers, setAnswers] = useState({})

  const submitAnswer = useCallback(async (sessionId, questionIndex, question, answer, interviewId) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/answer`, {
        questionIndex,
        question,
        answer,
        interviewId,
      })
      const evaluation = res.data.evaluation || res.data
      setAnswers((prev) => ({
        ...prev,
        [questionIndex]: { question, answer, evaluation },
      }))
      return { success: true, evaluation }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to evaluate answer.'
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  const completeSession = useCallback(async (sessionId) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/complete`)
      return { success: true, data: res.data }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to complete session.'
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  const resetInterview = useCallback(() => {
    setCurrentInterview(null)
    setCurrentSession(null)
    setAnswers({})
  }, [])

  return (
    <InterviewContext.Provider
      value={{
        currentInterview,
        currentSession,
        answers,
        setCurrentInterview,
        setCurrentSession,
        submitAnswer,
        completeSession,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  const ctx = useContext(InterviewContext)
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider')
  return ctx
}
