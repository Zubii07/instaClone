import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import dotenv from "dotenv";
dotenv.config();

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSearch = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/search?query=${searchQuery}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    setQuery("");
    setResults([]); // Clear the results
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="rounded-full pl-10 pr-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all duration-200 hover:shadow-md"
        placeholder="Search"
        value={query}
        onChange={handleSearch}
      />
      <span className="absolute left-3 top-2.5 text-gray-500">
        <IoIosSearch />
      </span>
      {loading && (
        <p className="absolute mt-2 text-sm text-gray-500">Loading...</p>
      )}
      {results.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 w-full mt-2 rounded-lg shadow-lg z-10">
          {results.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
