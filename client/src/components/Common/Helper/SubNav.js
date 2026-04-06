import { useEffect, useState } from "react";
import { employeeAPI } from "../../../api/index";
import "./SubNav.css";
import { useDispatch } from "react-redux";
import { setName } from "../../../store/nameSlice";

const SubNav = () => {
  const [profilepic, setProfilePic] = useState([]);
  const dispatch = useDispatch();
  const serverURL = process.env.REACT_APP_SERVER_URL;

  const email = localStorage.getItem("email");
  useEffect(() => {
    employeeAPI
      .getAll()
      .then((res) => {
        let profile = res.data.filter((user) => {
          return user.email === email;
        });
        setProfilePic(profile);
        dispatch(setName(profile[0]?.name));
      })
      .catch((err) => console.log(err, "it has an error"));
  }, []);

  return (
    <>
      <nav className="subnav pt-3 pb-3 pe-3 navbar navbar-expand navbar-dark">
        <div className="px-0 container-fluid">
          <div className="d-flex justify-content-end w-100">
            <div className="align-items-center navbar-nav">
              {profilepic.map((user, index) => {
                return (
                  <div key={index} className="media d-flex align-items-center">
                    <div className="media-body">
                      <span className="mb-0 font-small fw-bold">
                        {user.name}
                      </span>
                      <span className="mb-0 font-small ">skarosoft</span>
                    </div>
                    <img
                      src={user.uploaded_file}
                      className="user-avatar md-avatar rounded-circle"
                      alt=""
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
export default SubNav;
