import axios from 'axios';
import { hashPassword } from '../utils/crypto';

interface LoginParams {
  username: string;
  password: string;
}

export const login = async (params: LoginParams) => {
  const formData = new FormData();
  formData.append('username', params.username);
  formData.append('password', hashPassword(params.password));
  
  try {
    const response = await axios.post('/api/auth/token', formData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
}; 