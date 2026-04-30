"use client";

import { Provider as ReduxProvider } from "react-redux";
import store from "@/utils/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  setAdminCredentials,
  logoutAdmin,
} from "@/utils/slices/adminAuthSlice";
import { useRouter } from "next/navigation";
import { adminApiSlice } from "@/utils/slices/adminApiSlice";

import { SocketProvider } from "@/utils/context/SocketContext";
import QuickChatPopup from "@/components/Admin/Communication/QuickChatPopup";
import { toast } from "react-toastify";
import { MODULES } from "@/components/config/modules";

function AdminBootstrap({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const admin = useSelector(
    (state) => state.adminAuth.adminInfo
  );

  const [ready, setReady] = useState(false);

  const PUBLIC_ROUTES = ["/","/forgot-password"];

  useEffect(() => {
    // Skip auth check on login page
    if (PUBLIC_ROUTES.includes(pathname)) {
      setReady(true);
      return;
    }

    // ❌ No localStorage → logout immediately
    if (!admin) {
      router.replace("/"); // ⛔ redirect to login
      setReady(true);
      return;
    }


    // ✅ localStorage exists → verify cookie
    const validate = async () => {
      try {
        const res = await dispatch(
          adminApiSlice.endpoints.getAdminMe.initiate()
        ).unwrap();

        // Refresh adminInfo from server
        dispatch(setAdminCredentials(res.admin));
      } catch {
        // Cookie invalid
        dispatch(logoutAdmin());
      } finally {
        setReady(true);
      }
    };

    validate();
  }, [dispatch, pathname]);

  // ⛔ Authorization Check: Prevent manual URL access to unauthorized modules
  useEffect(() => {
    // Only run when ready and admin is logged in (SuperAdmin has full access)
    if (!ready || !admin || admin.isSuperAdmin) return;

    // Public routes and selection portal are always allowed
    if (PUBLIC_ROUTES.includes(pathname) || pathname === "/select-portal") return;

    // Check if the current path belongs to a restricted module
    const matchingModule = MODULES.find(m => 
      pathname === m.route || pathname.startsWith(m.route + "/")
    );

    if (matchingModule) {
      // Define access logic (mirroring selectportal.jsx)
      let hasAccess = false;
      if (admin.role === "CA") {
        hasAccess = ["Transaction Ledger", "Downloads", "Document Management"].includes(matchingModule.id);
      } else {
        hasAccess = admin.modules?.includes(matchingModule.id);
      }

      if (!hasAccess) {
        toast.error("You don't have permission to access this module");
        router.replace("/select-portal");
      }
    }
  }, [admin, pathname, ready, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SocketProvider>
      {children}
      {!PUBLIC_ROUTES.includes(pathname) && <QuickChatPopup />}
    </SocketProvider>
  );
}


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <AdminBootstrap>
        {children}
        <ToastContainer />
      </AdminBootstrap>
    </ReduxProvider>
  );
}
