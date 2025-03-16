import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Card, Spinner, Button } from "react-bootstrap";

const PostDetail = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching post:", error));
  }, [id]);

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

export default PostDetail;
