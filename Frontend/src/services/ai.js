import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL
const AI_URL = import.meta.env.VITE_AI_URL

export const getAIResponse = async (message) => {
    try {
        const res = await axios.get(`${API_BASE_URL}${AI_URL}`, {
            params: { message },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        return res.data.response
    } catch (error) {
        console.error('AI Fetch Failed', error)
        throw error
    }
}