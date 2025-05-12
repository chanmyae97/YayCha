import { useContext, createContext, useState } from "react";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import App from "./App";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export default function ThemedApp() {
  const [showForm, setShowForm] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <AppContext.Provider value={{ showForm, setShowForm }}>
        <App />
        <CssBaseline />
      </AppContext.Provider>
    </ThemeProvider>
  );
}
