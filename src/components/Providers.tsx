// components/Providers.tsx
"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef(store);
    if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = store;
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </PersistGate>
    </Provider>
  );
};

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useState } from "react";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";

// export function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         {children}
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }


// "use client";
// import { Provider } from "react-redux";
// import React, { useMemo, useRef } from "react";
// import { persistor, store } from "@/store/store";
// import { PersistGate } from "redux-persist/integration/react";
// // import { PersistGate } from "redux-persist/integration/react";
// // import { AppStore, makeStore } from "@/store/store";

// export const ColorModeContext = React.createContext({
//   toggleColorMode: () => {},
// });

// export const Providers = ({ children }: { children: React.ReactNode }) => {
//   const storeRef = useRef<any>(null);
//   const persistRef = useRef(persistor); // Assign store to storeRef
//   // Assign store to storeRef
  // if (!storeRef.current) {
  //   // Create the store instance the first time this renders
  //   storeRef.current = store;
  // }
//   return (
//     <Provider store={storeRef.current}>
//       <PersistGate loading={null} persistor={persistor}>
//         {children}
//       </PersistGate>
//     </Provider>
//   );
// };
