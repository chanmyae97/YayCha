import { useRef, useState } from "react";

import { Box, TextField, Button, Alert } from "@mui/material";
import { AppContext } from "../ThemedApp";

export default function Form({ add }) {
  const contentRef = useRef();
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const content = contentRef.current.value.trim();
    setError(null);
    add.mutate(content);
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 4, textAlign: "right" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          inputRef={contentRef}
          type="text"
          placeholder="Content"
          fullWidth
          multiline
          sx={{ mb: 1 }}
          error={!!error}
        />
        <Button variant="contained" type="submit">
          Post
        </Button>
      </Box>
    </form>
  );
}
