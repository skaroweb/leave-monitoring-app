import { Col, Row, Card, Image, Button, Container } from "react-bootstrap";

import "./index.css";
import { Link } from "react-router-dom";
import NotFoundImage from "../../../assets/img/illustrations/404.svg";

function My404Component() {
  return (
    <>
      <main>
        <section className="vh-100 d-flex align-items-center justify-content-center">
          <Container>
            <Row>
              <Col
                xs={12}
                className="text-center d-flex align-items-center justify-content-center"
              >
                <div>
                  <Image src={NotFoundImage} className="img-fluid w-75" />
                  <h1 className="text-primary mt-5">
                    Page not <span className="fw-bolder">found</span>
                  </h1>
                  <p className="lead my-4">
                    Oops! Looks like you followed a bad link. If you think this
                    is a problem with us, please tell us.
                  </p>
                  <Button as={Link} className="animate-hover" to="/">
                    Go back home
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </>
  );
}
export default My404Component;
