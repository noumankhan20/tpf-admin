"use client";

import { Provider as ReduxProvider } from "react-redux";
import store from "@/utils/store/store";
export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
