// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#504ead", // cor principal que você deseja
    },
    secondary: {
      main: "#504ead", // cor secundária
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif", // fonte global
  },
});

export default theme;
