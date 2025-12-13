"use client";

import { Provider as ReduxProvider } from "react-redux";
import store from "@/utils/store/store";
import AuthHydrator from "./AuthHydrator";
export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <AuthHydrator />
      {children}
    </ReduxProvider>
  );
}
