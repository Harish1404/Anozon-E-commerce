import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const fetchProductsByCategory = async (category, page = 1, limit = 30) => {
  const response = await axios.get(`${API_URL}/categories/${category}`, {
    params: { page, limit }
  });
  return response.data;
};
