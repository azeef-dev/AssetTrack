import toast from "react-hot-toast";
import { Check, X } from "lucide-react";

const baseStyle =
    "bg-white shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[320px] border border-gray-100";

export const showSuccessToast = (message) => {
    toast.custom(
        (t) => (
            <div
                className={`${baseStyle} transition-all duration-300 ${t.visible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-6 scale-95"
                    }`}
            >
                <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                    <Check className="text-white" size={18} strokeWidth={3} />
                </div>
                <span className="text-[#3f3f46] text-[15px] font-medium font-poppins">
                    {message}
                </span>
            </div>
        ),
        {
            duration: 3000,
            position: "top-center",
        }
    );
};

export const showErrorToast = (message) => {
    toast.custom(
        (t) => (
            <div
                className={`${baseStyle} transition-all duration-300 ${t.visible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-6 scale-95"
                    }`}
            >
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                    <X className="text-white" size={18} strokeWidth={3} />
                </div>
                <span className="text-[#3f3f46] text-[15px] font-medium font-poppins">
                    {message}
                </span>
            </div>
        ),
        {
            duration: 3000,
            position: "top-center",
        }
    );
};