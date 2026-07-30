import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logActivity } from "../firebase/activityLogger";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "assets"), (snapshot) => {
      setAssets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const generateAssetCode = () => {
    const prefix = category ? category.substring(0, 3).toUpperCase() : "AST";
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const assetCode = generateAssetCode();
      const docRef = await addDoc(collection(db, "assets"), {
        name,
        category,
        location,
        description,
        assetCode,
        status: "active",
        createdBy: currentUser?.email,
        createdAt: serverTimestamp(),
      });

      await logActivity(docRef.id, `Asset "${name}" create kiya gaya`, currentUser?.email);

      setName("");
      setCategory("");
      setLocation("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen bg-slate-50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Assets</h1>
            <p className="text-slate-500 text-sm">Manage your assets</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Add Asset"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddAsset}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dell Latitude 5420"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Laptop, Printer"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lab 1 - Room 101"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Saving..." : "Save Asset"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-5">
          <div className="relative w-full md:w-1/3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, category..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{asset.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{asset.assetCode}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${asset.status === "active"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                    }`}
                >
                  {asset.status}
                </span>
              </div>

              <p className="text-sm text-slate-500 mb-1">📍 {asset.location}</p>
              <p className="text-sm text-slate-500 mb-4">🏷️ {asset.category}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="bg-white p-2 border border-slate-100 rounded-xl">
                  <QRCodeSVG
                    value={`${window.location.origin}/asset/${asset.assetCode}`}
                    size={64}
                  />
                </div>
                <Link
                  to={`/asset/${asset.assetCode}`}
                  className="text-amber-600 text-sm font-semibold hover:text-amber-700"
                >
                  View Page →
                </Link>
              </div>
            </div>
          ))}

          {filteredAssets.length === 0 && (
            <p className="text-slate-400 col-span-full text-center py-10 text-sm">
              No assets found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assets;