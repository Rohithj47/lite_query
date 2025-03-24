import React from "react";
import { Routes, Route } from "react-router-dom";
// import {
//   QueryClient,
//   QueryClientProvider,
//   useQuery,
// } from "@tanstack/react-query";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "../utils/react-query-lite"; // Custom React Query implementation
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
    </QueryClientProvider>
  );
};

export default App;

const getPosts = () =>
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then((response) => response.json())
    // add a wait for 1 second to simulate a slow network
    .then(
      (data) => new Promise((resolve) => setTimeout(() => resolve(data), 1000))
    )
    .then((data) => data.slice(0, 10))
    .catch((error) => console.error("Error fetching posts: ", error));

const getPost = (postId) =>
  fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
    // add a wait for 1 second to simulate a slow network
    .then(
      (response) =>
        new Promise((resolve) => setTimeout(() => resolve(response), 1000))
    )
    .then((response) => response.json())
    .catch((error) => console.error("Error fetching posts: ", error));

const Home = () => {
  const {
    data: posts,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
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
      {isError && (
        <p className="text-danger text-center">
          Error fetching posts. Please try again later.
        </p>
      )}
      {isFetching && (
        // display a text saying query is fetching
        <p className="text-center text-light mt-3">Background updating</p>
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

  const {
    data: post,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

  return (
    <Container
      fluid
      className="bg-dark text-light min-vh-100 py-4 d-flex flex-column align-items-center"
    >
      {isLoading && <Spinner animation="border" variant="light" />}
      {isError && (
        <p className="text-danger text-center">
          Error fetching post. Please try again later.
        </p>
      )}
      {isFetching && (
        // display a text saying query is fetching
        <p className="text-center text-light mt-3">Background updating</p>
      )}
      {post && (
        <Card className="bg-secondary text-light w-75">
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>{post.body}</Card.Text>
            <Link to="/">
              <Button variant="light">Back to Posts</Button>
            </Link>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
