import React, { useEffect, useState } from "react";
import { Container, ListGroup, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.slice(0, 10)); // Limit to 10 posts
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  return (
    <Container fluid className="bg-dark text-light min-vh-100 py-4">
      <h2 className="mb-3 text-center">Posts</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <ListGroup variant="flush">
          {posts.map((post) => (
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
      )}
    </Container>
  );
};

export default Home;
