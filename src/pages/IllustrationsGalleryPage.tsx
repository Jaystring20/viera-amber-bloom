import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { IllustrationsGallery } from "@/components/IllustrationsGallery";
import { COLORS } from "@/components/IllustrationsGallery/constants";

/**
 * Illustrations Gallery Page
 *
 * Full-page implementation of the Illustrations Gallery with:
 * - Navigation bar
 * - Main gallery component
 * - Footer
 * - Luxury editorial styling
 */
const IllustrationsGalleryPage = () => {
  return (
    <div
      style={{
        backgroundColor: COLORS.alabaster,
        minHeight: "100vh",
      }}
    >
      <NavBar />

      <main
        style={{
          paddingTop: "64px", // Account for sticky header
        }}
      >
        <IllustrationsGallery initialCategory="fashion" />
      </main>

      <Footer />
    </div>
  );
};

export default IllustrationsGalleryPage;
