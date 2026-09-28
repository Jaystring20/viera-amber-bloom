import { motion, useReducedMotion } from "framer-motion";
import { Artwork, Section } from "./types";
import { IllustrationCard } from "./IllustrationCard";
import { SectionHeader } from "./SectionHeader";
import { COLORS, SPACING, SECTIONS } from "./constants";

interface IllustrationGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
}

export const IllustrationGrid = ({
  artworks,
  onArtworkClick,
}: IllustrationGridProps) => {
  const reduced = useReducedMotion();

  // Group artworks into sections
  const sections: Section[] = SECTIONS.map((section) => {
    const sectionArtworks = artworks.filter(
      (a) => a.seq >= section.seq_start && a.seq <= section.seq_end
    );
    return {
      id: `section-${section.number}`,
      number: section.number,
      name: section.name,
      seq_start: section.seq_start,
      seq_end: section.seq_end,
      artworks: sectionArtworks,
    };
  });

  // Filter out empty sections
  const filledSections = sections.filter((s) => s.artworks.length > 0);

  return (
    <motion.section
      style={{
        backgroundColor: COLORS.alabaster,
        paddingLeft: SPACING.containerSidePadding,
        paddingRight: SPACING.containerSidePadding,
        paddingBottom: "80px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.5 }}
    >
      <div className="mx-auto" style={{ maxWidth: SPACING.maxWidth }}>
        {filledSections.map((section, sectionIndex) => (
          <div key={section.id} style={{ marginBottom: SPACING.sectionBreak }}>
            {/* Section Header */}
            <SectionHeader
              number={section.number}
              name={section.name}
              index={sectionIndex}
            />

            {/* Grid of illustrations */}
            <motion.div
              className="grid gap-0"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: SPACING.gridGap,
                marginTop: "40px",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: reduced ? 0 : 0.5,
              }}
            >
              {section.artworks.map((artwork, artworkIndex) => (
                <IllustrationCard
                  key={artwork.id}
                  artwork={artwork}
                  index={sectionIndex * 10 + artworkIndex}
                  onClick={() => onArtworkClick(artwork)}
                />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
