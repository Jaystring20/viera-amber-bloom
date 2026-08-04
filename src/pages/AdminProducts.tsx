import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Save, ChevronDown, ChevronUp, Search, Eye, EyeOff, Star, Filter, MoreVertical, Copy, Check } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Product {
  id?: string;
  title: string;
  subtitle: string;
  type: "garment" | "print";
  badge: string;
  images: string[];
  price_ngn: number;
  price_usd: number;
  description: string;
  full_description?: string;
  materials?: string;
  care_instructions?: string;
  size_guide?: string;
  style_notes?: string;
  occasions?: string[];
  colors?: string[];
  fit_details?: string;
  ai_enhanced?: boolean;
  featured?: boolean;
  active?: boolean;
  sort_order?: number;
}

const COLORS = {
  ALABASTER: "#FAF9F6",
  BURGUNDY: "#6E0025",
  GOLD: "#D4AF37",
  DARK_TEXT: "#221A1A",
  BURG_ALPHA: "rgba(110,0,37,0.14)",
  SUCCESS: "#16a34a",
  WARNING: "#ea580c",
};

const CORMORANT = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "garment" | "print">("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"created" | "title" | "price">("created");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    title: "",
    subtitle: "",
    type: "garment",
    badge: "",
    images: [],
    price_ngn: 0,
    price_usd: 0,
    description: "",
    full_description: "",
    materials: "",
    care_instructions: "",
    size_guide: "",
    style_notes: "",
    occasions: [],
    colors: [],
    fit_details: "",
    featured: false,
    active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = products
    .filter(p => {
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterType !== "all" && p.type !== filterType) return false;
      if (filterActive === "active" && !p.active) return false;
      if (filterActive === "inactive" && p.active) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "price":
          return (a.price_ngn || 0) - (b.price_ngn || 0);
        case "created":
        default:
          return 0;
      }
    });

  const handleSave = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([formData]);

        if (error) throw error;
      }

      await fetchProducts();
      setEditingId(null);
      setShowNewForm(false);
      resetForm();
    } catch (e) {
      alert("Failed to save product: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchProducts();
    } catch (e) {
      alert("Failed to delete product: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id || null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNewForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      type: "garment",
      badge: "",
      images: [],
      price_ngn: 0,
      price_usd: 0,
      description: "",
    } as Product);
  };

  const copyProductJson = (product: Product) => {
    const json = JSON.stringify(product, null, 2);
    navigator.clipboard.writeText(json);
    setCopiedId(product.id || null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = {
    total: products.length,
    garments: products.filter(p => p.type === "garment").length,
    prints: products.filter(p => p.type === "print").length,
    featured: products.filter(p => p.featured).length,
    active: products.filter(p => p.active).length,
  };

  return (
    <div style={{ background: COLORS.ALABASTER, minHeight: "100vh" }}>
      <NavBar />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "100px 20px 40px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: CORMORANT, fontSize: 48, fontWeight: 700, color: COLORS.BURGUNDY, margin: "0 0 8px 0" }}>
            Product Management
          </h1>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.6)", margin: 0 }}>
            Manage all VIVA products, enable AI enhancement, and keep descriptions fresh
          </p>
        </div>

        {/* Stats Dashboard */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total Products", value: stats.total, color: COLORS.BURGUNDY },
            { label: "Garments", value: stats.garments, color: COLORS.GOLD },
            { label: "Prints", value: stats.prints, color: COLORS.SUCCESS },
            { label: "Active", value: stats.active, color: COLORS.SUCCESS },
            { label: "Featured", value: stats.featured, color: COLORS.WARNING },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${COLORS.BURG_ALPHA}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: 12, color: "rgba(0,0,0,0.4)" }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: `1px solid ${COLORS.BURG_ALPHA}`,
                borderRadius: 8,
                fontFamily: "DM Sans",
                fontSize: 14,
              }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{
              padding: "10px 12px",
              border: `1px solid ${COLORS.BURG_ALPHA}`,
              borderRadius: 8,
              fontFamily: "DM Sans",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <option value="all">All Types</option>
            <option value="garment">Garments</option>
            <option value="print">Prints</option>
          </select>

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            style={{
              padding: "10px 12px",
              border: `1px solid ${COLORS.BURG_ALPHA}`,
              borderRadius: 8,
              fontFamily: "DM Sans",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "10px 12px",
              border: `1px solid ${COLORS.BURG_ALPHA}`,
              borderRadius: 8,
              fontFamily: "DM Sans",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <option value="created">Sort by Created</option>
            <option value="title">Sort by Title</option>
            <option value="price">Sort by Price</option>
          </select>

          <motion.button
            onClick={() => setShowNewForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: COLORS.BURGUNDY,
              color: COLORS.GOLD,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontFamily: "DM Sans",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={18} /> New Product
          </motion.button>
        </div>

        {/* Product List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontSize: 16, color: COLORS.BURGUNDY }}>
            Loading products...
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontSize: 16, color: COLORS.BURGUNDY }}>
            {searchTerm || filterType !== "all" ? "No products match your filters." : "No products yet. Create your first one!"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isEditing={editingId === product.id}
                isExpanded={expandedId === product.id}
                isCopied={copiedId === product.id}
                formData={editingId === product.id ? formData : null}
                setFormData={editingId === product.id ? setFormData : null}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSave}
                onCancel={handleCancel}
                onToggleExpand={() => setExpandedId(expandedId === product.id ? null : product.id)}
                onCopy={() => copyProductJson(product)}
              />
            ))}
          </div>
        )}

        {/* New Product Modal */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 20,
              }}
              onClick={handleCancel}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: "white",
                  borderRadius: 16,
                  maxWidth: 700,
                  width: "100%",
                  maxHeight: "90vh",
                  overflow: "auto",
                  padding: 40,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: CORMORANT, fontSize: 32, fontWeight: 700, color: COLORS.BURGUNDY, margin: 0 }}>
                    Create Product
                  </h2>
                  <motion.button
                    onClick={handleCancel}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.BURGUNDY,
                      padding: 8,
                    }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <ProductForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  isEditing: boolean;
  isExpanded: boolean;
  isCopied: boolean;
  formData: Product | null;
  setFormData: ((data: Product) => void) | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggleExpand: () => void;
  onCopy: () => void;
}

const ProductCard = ({
  product,
  isEditing,
  isExpanded,
  isCopied,
  formData,
  setFormData,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onToggleExpand,
  onCopy,
}: ProductCardProps) => {
  const statusColor = !product.active ? "rgba(0,0,0,0.3)" : product.featured ? "rgba(212,175,55,0.1)" : "white";

  return (
    <motion.div
      layout
      style={{
        background: statusColor,
        borderRadius: 12,
        border: `1px solid ${COLORS.BURG_ALPHA}`,
        overflow: "hidden",
      }}
    >
      {isEditing && formData && setFormData ? (
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          onSave={onSave}
          onCancel={onCancel}
          isInline
        />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 20,
              borderBottom: isExpanded ? `1px solid ${COLORS.BURG_ALPHA}` : "none",
            }}
          >
            {product.images?.[0] && (
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <img
                  src={product.images[0]}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                {product.images.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    +{product.images.length - 1}
                  </div>
                )}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: COLORS.BURGUNDY, margin: 0 }}>
                  {product.title}
                </h3>
                {product.featured && <Star size={16} fill={COLORS.GOLD} color={COLORS.GOLD} />}
                {!product.active && <Eye size={16} color="rgba(0,0,0,0.3)" />}
              </div>
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", margin: "0 0 4px 0" }}>
                {product.subtitle}
              </p>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(0,0,0,0.5)", flexWrap: "wrap" }}>
                <span>{product.type}</span>
                <span>₦{product.price_ngn?.toLocaleString()} / ${product.price_usd}</span>
                {product.ai_enhanced && <span style={{ color: COLORS.GOLD }}>✓ AI Enhanced</span>}
                {!product.active && <span style={{ color: "rgba(0,0,0,0.3)" }}>• Hidden</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <motion.button
                onClick={() => onEdit(product)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Edit"
                style={{
                  background: "rgba(110,0,37,0.1)",
                  color: COLORS.BURGUNDY,
                  border: "none",
                  borderRadius: 6,
                  padding: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Edit size={16} />
              </motion.button>

              <motion.button
                onClick={() => onDelete(product.id!)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete"
                style={{
                  background: "rgba(220,38,38,0.1)",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: 6,
                  padding: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={16} />
              </motion.button>

              <motion.button
                onClick={onCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copy JSON"
                style={{
                  background: isCopied ? "rgba(22,163,74,0.1)" : "rgba(0,0,0,0.05)",
                  color: isCopied ? COLORS.SUCCESS : "rgba(0,0,0,0.5)",
                  border: "none",
                  borderRadius: 6,
                  padding: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
              </motion.button>

              <motion.button
                onClick={onToggleExpand}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: COLORS.BURGUNDY,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.button>
            </div>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              style={{
                padding: 20,
                background: "rgba(0,0,0,0.02)",
                borderTop: `1px solid ${COLORS.BURG_ALPHA}`,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 12 }}>
                <DetailSection label="Description" content={product.description} />
                <DetailSection label="Full Description" content={product.full_description} />
                <DetailSection label="Materials" content={product.materials} />
                <DetailSection label="Care Instructions" content={product.care_instructions} />
                <DetailSection label="Fit Details" content={product.fit_details} />
                <DetailSection label="Style Notes" content={product.style_notes} />
                {product.occasions?.length > 0 && (
                  <DetailSection label="Occasions" content={product.occasions.join(", ")} />
                )}
                {product.colors?.length > 0 && (
                  <DetailSection label="Colors" content={product.colors.join(", ")} />
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

interface DetailSectionProps {
  label: string;
  content?: string;
}

const DetailSection = ({ label, content }: DetailSectionProps) => {
  if (!content) return null;

  return (
    <div>
      <strong style={{ color: COLORS.BURGUNDY }}>{label}:</strong>
      <p style={{ margin: "4px 0 0 0", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>
        {content}
      </p>
    </div>
  );
};

interface ProductFormProps {
  formData: Product;
  setFormData: (data: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  isInline?: boolean;
}

const ProductForm = ({ formData, setFormData, onSave, onCancel, isInline }: ProductFormProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const inputStyle: React.CSSProperties = {
    fontFamily: "DM Sans",
    fontSize: 13,
    padding: "10px 12px",
    border: `1px solid ${COLORS.BURG_ALPHA}`,
    borderRadius: 6,
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "DM Sans",
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.BURGUNDY,
    marginBottom: 4,
    display: "block",
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    try {
      const newUrls: string[] = [...(formData.images || [])];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const filename = `${timestamp}-${i}-${file.name}`;
        const path = `viva-products/${filename}`;

        const { error } = await supabase.storage.from("viva-assets").upload(path, file);
        if (error) throw error;

        const { data } = supabase.storage.from("viva-assets").getPublicUrl(path);
        if (data) newUrls.push(data.publicUrl);
      }

      setFormData({ ...formData, images: newUrls });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload images. Check console.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div style={{ padding: isInline ? 20 : 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={inputStyle}
            placeholder="Product name"
          />
        </div>
        <div>
          <label style={labelStyle}>Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "garment" | "print" })}
            style={inputStyle}
          >
            <option value="garment">Garment</option>
            <option value="print">Print</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Subtitle *</label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          style={inputStyle}
          placeholder="e.g., Look 01 · Collection"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Badge</label>
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            style={inputStyle}
            placeholder="e.g., Made to Order"
          />
        </div>
        <div>
          <label style={labelStyle}>Sort Order</label>
          <input
            type="number"
            value={formData.sort_order || 0}
            onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Images</label>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "inline-block", padding: "10px 16px", background: COLORS.BURGUNDY, color: "white", borderRadius: 6, cursor: uploadingImage ? "not-allowed" : "pointer", fontFamily: "DM Sans", fontSize: 12, fontWeight: 600, opacity: uploadingImage ? 0.6 : 1 }}>
            {uploadingImage ? "Uploading..." : "📸 Upload Images"}
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: "none" }} />
          </label>
        </div>

        {formData.images && formData.images.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", margin: "0 0 8px 0", fontWeight: 600 }}>Uploaded Images ({formData.images.length}):</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {formData.images.map((url, idx) => (
                <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                  <img src={url} alt={`img-${idx}`} style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover", border: `1px solid ${COLORS.BURG_ALPHA}` }} />
                  <button onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })} style={{ position: "absolute", top: -8, right: -8, background: "#EF4444", border: "none", borderRadius: 999, width: 20, height: 20, color: "white", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label style={{ ...labelStyle, marginTop: 12 }}>Or paste URLs (comma-separated)</label>
        <input
          type="text"
          value={formData.images?.join(", ") || ""}
          onChange={(e) =>
            setFormData({ ...formData, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
          }
          style={inputStyle}
          placeholder="/viva/look-1.webp, /viva/look-2.webp"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Price (NGN)</label>
          <input
            type="number"
            value={formData.price_ngn}
            onChange={(e) => setFormData({ ...formData, price_ngn: Number(e.target.value) })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Price (USD)</label>
          <input
            type="number"
            value={formData.price_usd}
            onChange={(e) => setFormData({ ...formData, price_usd: Number(e.target.value) })}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              style={{ marginRight: 6 }}
            />
            Featured
          </label>
        </div>
        <div>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={formData.active !== false}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ marginRight: 6 }}
            />
            Active
          </label>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Short Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="One-line description"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Full Description</label>
        <textarea
          value={formData.full_description || ""}
          onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
          style={{ ...inputStyle, minHeight: 80, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="Detailed product story"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Materials</label>
        <textarea
          value={formData.materials || ""}
          onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="Fabric composition"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Care Instructions</label>
        <textarea
          value={formData.care_instructions || ""}
          onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, fontFamily: "DM Sans", resize: "vertical" }}
          placeholder="How to care for this item"
        />
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <motion.button
          onClick={onSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: COLORS.BURGUNDY,
            color: COLORS.GOLD,
            border: "none",
            borderRadius: 6,
            fontFamily: "DM Sans",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Save size={16} /> Save
        </motion.button>
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: "transparent",
            color: COLORS.BURGUNDY,
            border: `1.5px solid ${COLORS.BURGUNDY}`,
            borderRadius: 6,
            fontFamily: "DM Sans",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
};

export default AdminProducts;
