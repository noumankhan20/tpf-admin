"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateAdminFromStorage } from "@/utils/slices/adminAuthSlice";
export default function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAdminFromStorage());
  }, [dispatch]);

  return null;
}
