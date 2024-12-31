import dotenv from "dotenv";
dotenv.config();
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
