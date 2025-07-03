import { useState } from "react";
import { useApp } from "./ThemedApp";

import Item from "./components/Item";
import Form from "./components/Form";
import Header from "./components/Header";
import { Box, Container } from "@mui/material";

export default function App() {
  const { showForm, setGlobalMsg } = useApp();

  const [data, setData] = useState([
    { id: 3, content: "Interesting one", name: "Chris" },
    { id: 2, content: "React is fun", name: "Bob" },
    { id: 1, content: "Hello World!", name: "Alice" },
  ]);

  const remove = (id) => {
    setData(data.filter((item) => item.id != id));
    setGlobalMsg("An item deleted");
  };

  const add = (content, name) => {
    const id = data[data.length - 1].id + 1;
    setData([...data, { id, content, name }]);
    setGlobalMsg("An item added");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          backgroundColor: (theme) => theme.palette.background.default,
          zIndex: 1,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            pt: 2,
            pb: 4,
          }}
        >
          {showForm && (
            <Box sx={{ mb: 3 }}>
              <Form add={add} />
            </Box>
          )}
          <Box>
            {data.map((item) => (
              <Item key={item.id} item={item} remove={remove} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
