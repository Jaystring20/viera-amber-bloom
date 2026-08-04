import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getArtworksByCollection, getCollectionMetadata } from "@/lib/gallery-data";
import { Artwork } from "@/lib/gallery-data";

const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);

  if (!collectionId) {
    return (
      <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
        <NavBar />
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <h1 className="font-display" style={{ fontSize: 32, color: "#111111" }}>
            Collection Not Found
          </h1>
        </div>
        <Footer />
      </div>
    );
  }

  const collection = getCollectionMetadata(collectionId as any);
  const artworks = getArtworksByCollection(collectionId as any);

  if (!collection || artworks.length === 0) {
    return (
      <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
        <NavBar />
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <h1 className="font-display" style={{ fontSize: 32, color: "#111111" }}>
            Collection Not Found
          </h1>
        </div>
        <Footer />
      </div>
    );
  }

  const featured = artworks[0];

  return (
    <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      <NavBar />

      <main className="pt-20">
        <section style={{ position: "relative", height: "500px", overflow: "hidden" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${featured.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)",
            }}
            aria-hidden="true"
          />

          <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "48px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
              <motion.button
                onClick={() => navigate("/illustrations")}
                whileHover={reduced ? {} : { x: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 24,
                  padding: 0,
                }}
              >
                <ChevronLeft size={16} />
                Back to Illustrations
              </motion.button>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display"
                style={{
                  fontSize: "clamp(40px, 6vw, 56px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: 0,
                  lineHeight: 1.1,
                  marginBottom: 12,
                }}
              >
                {collection.name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: 16,
                  color: "#FFFFFF",
                  margin: 0,
                  maxWidth: 600,
                }}
              >
                {artworks.length} {artworks.length === 1 ? "artwork" : "artworks"}
              </motion.p>
            </div>
          </div>
        </section>

        <section style={{ padding: "60px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {artworks.map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={reduced ? {} : { y: -4 }}
                  className="relative group cursor-pointer overflow-hidden rounded-lg"
                  style={{
                    aspectRatio: "1",
                    background: "#FFFFFF",
                    border: selectedItem?.id === item.id ? "2px solid #111111" : "1px solid #EBEBEB",
                    padding: 0,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s",
                    }}
                    className="group-hover:scale-105"
                  />

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.4)",
                      opacity: 0,
                      transition: "opacity 0.3s",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 16,
                    }}
                    className="group-hover:opacity-100"
                  >
                    <p
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "Montserrat, system-ui, sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {item.title}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#FFFFFF",
                borderRadius: 8,
                overflow: "hidden",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative",
              }}
            >
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  padding: 8,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F5F4F2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                }}
              >
                <X size={24} color="#111111" />
              </button>

              <div style={{ aspectRatio: "1", width: "100%", overflow: "hidden" }}>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ padding: 32 }}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#111111",
                    margin: "0 0 12px 0",
                  }}
                >
                  {selectedItem.title}
                </h3>

                {selectedItem.story && (
                  <p
                    style={{
                      fontFamily: "Montserrat, system-ui, sans-serif",
                      fontSize: 14,
                      color: "#666666",
                      lineHeight: 1.7,
                      margin: "0 0 24px 0",
                    }}
                  >
                    {selectedItem.story}
                  </p>
                )}

                <motion.button
                  onClick={() => {
                    const whatsappNumber = "2348074022917";
                    const message = `Hi, I'd like to commission: ${selectedItem.title}\n\n${selectedItem.story}`;
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappLink = `https://wa.me/${whatsappNumber}/?text=${encodedMessage}`;
                    window.open(whatsappLink, "_blank");
                  }}
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  style={{
                    fontFamily: "Montserrat, system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "12px 40px",
                    background: "#111111",
                    color: "#FFFFFF",
                    border: "2px solid #111111",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  Commission This Style
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default CollectionPage;
