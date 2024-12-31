const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const fetchProfileDataById = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile data by ID:", error);
    throw error;
  }
};

export { fetchProfileDataById };
