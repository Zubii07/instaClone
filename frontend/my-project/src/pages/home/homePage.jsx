import React from "react";
import StorySection from "../../components/StorySection";
import Navbar from "../../components/Navbar";
import PostSection from "../../components/PostSection";

const Header = () => {
  return (
    <div>
      <Navbar />
      <StorySection />
      <PostSection />
    </div>
  );
};

export default Header;
