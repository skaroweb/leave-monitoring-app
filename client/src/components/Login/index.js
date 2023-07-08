import { useState } from "react";
import axios from "axios";
import { Col, Row, Form, Button, Container, InputGroup } from "react-bootstrap";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BgImage from "../../assets/img/illustrations/signin.svg";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  // const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "https://leave-monitoring.onrender.com/api/auth";
      const getdata = await axios.post(url, data);
      console.log(getdata);

      localStorage.setItem("token", getdata.data.data);
      localStorage.setItem("email", getdata.data.email);
      toast.success("Logged In successfully completed", 1000);
      //navigate("/", { state: { token: getdata.data.data } });
      window.location = "/";
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        //setError(error.response.data.message);
        toast.warn(error.response.data.message);
      }
    }
  };

  return (
    <>
      <main>
        <section className="d-flex align-items-center ">
          <Container className="contain">
            <Row
              className="justify-content-center form-bg-image"
              style={{ backgroundImage: `url(${BgImage})` }}
            >
              <Col
                xs={12}
                className="d-flex align-items-center justify-content-center"
              >
                <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                  <img src="/skaro.png" alt="skaro" />
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">Sign in to Skaro</h3>
                  </div>
                  <Form className="mt-4" onSubmit={handleSubmit}>
                    <Form.Group id="email" className="mb-4">
                      <Form.Label>Your Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fa fa-envelope" aria-hidden="true"></i>
                        </InputGroup.Text>
                        <Form.Control
                          autoFocus
                          required
                          type="email"
                          placeholder="example@company.com"
                          name="email"
                          onChange={handleChange}
                          value={data.email}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group>
                      <Form.Group id="password" className="mb-4">
                        <Form.Label>Your Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i
                              className="fa fa-unlock-alt"
                              aria-hidden="true"
                            ></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="password"
                            placeholder="Password"
                            name="password"
                            onChange={handleChange}
                            value={data.password}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                      Sign in
                    </Button>
                  </Form>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default Login;
