/* eslint-disable */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../../api/index";
import { Col, Row, Form, Button, Container, InputGroup } from "react-bootstrap";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import styles from "./styles.module.css";
import BgImage from "../../../assets/img/illustrations/signin.svg";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const serverURL = process.env.REACT_APP_SERVER_URL;
  // const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const getdata = await authAPI.login(data);
      console.log(getdata);

      localStorage.setItem("token", getdata.data.data);
      localStorage.setItem("email", getdata.data.email);
      toast.success("Logged In successfully completed", 1000);
      //navigate("/", { state: { token: getdata.data.data } });


      if (getdata.data.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    }
    catch (error) {
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
                        <Form.Control
                          autoFocus
                          required
                          type="email"
                          placeholder="example@company.com"
                          name="email"
                          onChange={handleChange}
                          value={data.email}
                        />
                        <Button
                          variant="outline-secondary"
                          disabled
                          style={{ borderLeft: "none", pointerEvents: "none" }}
                        >
                          <i className="fa fa-envelope" aria-hidden="true"></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    <Form.Group>
                      <Form.Group id="password" className="mb-4">
                        <Form.Label>Your Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            required
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            name="password"
                            onChange={handleChange}
                            value={data.password}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={togglePasswordVisibility}
                            style={{ borderLeft: "none" }}
                          >
                            <i
                              className={
                                showPassword
                                  ? "fa fa-eye-slash"
                                  : "fa fa-eye"
                              }
                              aria-hidden="true"
                            ></i>
                          </Button>
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

