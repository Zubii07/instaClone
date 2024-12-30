const fetchProfileDataById = async () => {
  try {
    const response = await axios.get(`localhost:5000/api/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile data by ID:", error);
    throw error;
  }
};

export { fetchProfileDataById };
