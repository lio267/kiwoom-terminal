'use client';

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryClientConfig,
} from "@tanstack/react-query";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => new QueryClient(queryClientConfig));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
