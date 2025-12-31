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

function AdminBootstrap({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const admin = useSelector(
    (state) => state.adminAuth.adminInfo
  );

  const [ready, setReady] = useState(false);

  const PUBLIC_ROUTES = ["/"];

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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return children;
}


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SocketProvider } from "@/utils/context/SocketContext";

export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <AdminBootstrap>
        <SocketProvider>
          {children}
        </SocketProvider>
        <ToastContainer />
      </AdminBootstrap>
    </ReduxProvider>
  );
}
