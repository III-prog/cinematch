"use client";

import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";

const ClientAuthInit = () => {
  const { refreshAuth } = useAuth();

  useEffect(() => {
    refreshAuth();
    // Run once on mount to sync client auth state.
  }, [refreshAuth]);

  return null;
};

export default ClientAuthInit;


