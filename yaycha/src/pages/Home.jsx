import { Alert, Box } from "@mui/material";

import Form from "../components/Form";
import Item from "../components/Item";

import { useApp } from "../ThemedApp";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";

const api = import.meta.env.VITE_API;

export default function Home() {
  const { showForm, setShowForm, setGlobalMsg } = useApp();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(`${api}/content/posts`);
      return res.json();
    },
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      await fetch(`${api}/content/posts/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: (id) => {
      queryClient.cancelQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts"], (old) =>
        old.filter((item) => item.id !== id)
      );
      setGlobalMsg("A post deleted");
    },
  });

  const add = (content, name) => {
    const id = data[0].id + 1;
    setData([{ id, content, name }, ...data]);
    setGlobalMsg("An item added");
  };

  if (isError) {
    return (
      <Box>
        <Alert severity="warning">{error.message}</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <Box sx={{ textAlign: "center" }}>Loading...</Box>;
  }
  return (
    <Box>
      {showForm && <Form add={add} />}
      {data.map((item) => {
        return <Item key={item.id} item={item} remove={remove.mutate} />;
      })}
    </Box>
  );
}
