import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    const [assets, setAssets] = useState([]);
    const [issues, setIssues] = useState([]);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubAssets = onSnapshot(collection(db, "assets"), (snapshot) => {
            setAssets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        const unsubIssues = onSnapshot(collection(db, "issues"), (snapshot) => {
            setIssues(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubAssets();
            unsubIssues();
        };
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const totalAssets = assets.length;
    const activeAssets = assets.filter((a) => a.status === "active").length;
    const underMaintenance = assets.filter((a) => a.status === "maintenance").length;
    const reportedIssues = issues.filter((i) => i.status !== "resolved").length;

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 min-h-screen bg-slate-50 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                            <span className="text-lg">🛠️</span> 
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">MaintainIQ</h1>
                            <p className="text-slate-400 text-xs tracking-wide uppercase">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1.5 pr-4 py-1.5">
                            <span className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-700 text-xs font-bold flex items-center justify-center">
                                {(currentUser?.displayName || currentUser?.email || "U").charAt(0).toUpperCase()}
                            </span>
                            <span className="text-sm text-slate-600 font-medium">
                                {currentUser?.displayName || currentUser?.email}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition cursor-pointer active:scale-[0.98] flex items-center gap-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Assets</p>
                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">📦</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{totalAssets}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Active Assets</p>
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">✅</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-600">{activeAssets}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Under Maintenance</p>
                            <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">🔧</span>
                        </div>
                        <p className="text-3xl font-bold text-amber-600">{underMaintenance}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Reported Issues</p>
                            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-sm">⚠️</span>
                        </div>
                        <p className="text-3xl font-bold text-red-600">{reportedIssues}</p>
                    </div>
                </div>

                {/* Recent Assets Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900">Recent Assets</h2>
                        <span className="text-xs text-slate-400 font-medium">{assets.length} total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">
                                    <th className="py-2.5 font-semibold">Asset Name</th>
                                    <th className="font-semibold">Asset Code</th>
                                    <th className="font-semibold">Category</th>
                                    <th className="font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.slice(0, 5).map((asset) => (
                                    <tr key={asset.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                                        <td className="py-3 text-slate-800 font-medium">{asset.name}</td>
                                        <td className="text-slate-500">{asset.assetCode}</td>
                                        <td className="text-slate-500">{asset.category}</td>
                                        <td>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${asset.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {asset.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {assets.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center text-slate-400 py-8 text-sm">
                                            No assets have been added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Issues Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900">Recent Issues</h2>
                        <span className="text-xs text-slate-400 font-medium">{issues.length} total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">
                                    <th className="py-2.5 font-semibold">Issue Title</th>
                                    <th className="font-semibold">Priority</th>
                                    <th className="font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.slice(0, 5).map((issue) => (
                                    <tr key={issue.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                                        <td className="py-3 text-slate-800 font-medium">{issue.title}</td>
                                        <td className="text-slate-500">{issue.priority}</td>
                                        <td>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${issue.status === "resolved"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : issue.status === "in-progress"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {issue.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {issues.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center text-slate-400 py-8 text-sm">
                                            No issues have been reported yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;