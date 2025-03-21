import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Container, ListGroup, Spinner, Card, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
      <DevTools />
    </QueryClientProvider>
  );
};

export default App;

const getPosts = () =>
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then((response) => response.json())
    .then((data) => data.slice(0, 10))
    .catch((error) => console.error("Error fetching posts: ", error));

const getPost = (postId) =>
  fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
    .then((response) => response.json())
    .catch((error) => console.error("Error fetching posts: ", error));

const Home = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
  return (
    <Container fluid className="bg-dark text-light min-vh-100 py-4">
      <h2 className="mb-3 text-center">Posts</h2>
      {isLoading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="light" />
        </div>
      )}
      <ListGroup variant="flush">
        {(posts || []).map((post) => (
          <ListGroup.Item key={post.id} className="bg-secondary text-light">
            <Link
              to={`/posts/${post.id}`}
              className="text-light text-decoration-none"
            >
              {post.title}
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

const PostDetail = () => {
  const { id } = useParams(); // Get the post ID from the URL

  const { data: post, isLoading: loading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

  return (
    <Container
      fluid
      className="bg-dark text-light min-vh-100 py-4 d-flex flex-column align-items-center"
    >
      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : post ? (
        <Card className="bg-secondary text-light w-75">
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>{post.body}</Card.Text>
            <Link to="/">
              <Button variant="light">Back to Posts</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <p>Post not found.</p>
      )}
    </Container>
  );
};

const DevTools = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);

  // Get all queries
  const queries = queryClient.getQueryCache().getAll();

  return (
    <Container
      fluid
      className="bg-dark text-light fixed-bottom p-3"
      style={{ zIndex: 9999 }}
    >
      <Button
        variant="light"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{ marginBottom: "5px" }}
      >
        {isOpen ? "Hide DevTools" : "Show DevTools"}
      </Button>

      {isOpen && (
        <div>
          <h4>Queries</h4>
          <ListGroup variant="flush">
            {queries.map((query) => (
              <ListGroup.Item key={query.queryHash} className="bg-secondary">
                <strong>{query.queryKey.join(", ")}</strong>:{" "}
                {query.state.status}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </Container>
  );
};
